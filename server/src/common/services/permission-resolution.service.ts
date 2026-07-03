import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { OverrideEffect } from '@/common/enums/override-effect.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import {
  CORE_FEATURE_SLUGS,
  isCoreFeature,
  getPlanFeature,
} from '@/common/constants/feature-mapping'
import { StoreFeatureEntity } from '@/modules/system/store/entities/store-feature.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

export interface PermissionManifest {
  featuresEnabled: string[]
  permissions: string[]
}

export interface PermissionScopeContext {
  branchId?: string
  warehouseId?: string
}

/**
 * The core policy engine — simplified 3-step permission resolution.
 *
 * Step 1: Is the feature enabled for this store?
 *         → Check store_features (admin override) first.
 *         → Fall back to subscription_plans.features[].
 *
 * Step 2: Collect all permissions the user holds via their active, non-expired role assignments.
 *         Roles are flat — no inheritance chain.
 *
 * Step 3: Does the collected permission set include the required permission slug?
 *         → ALLOW or DENY.
 *
 * Key rules:
 * - Super Admins bypass all checks (handled at the guard layer).
 * - Expired role assignments are automatically ignored.
 * - The permission manifest is cached per-user for 5 minutes and invalidated on role change.
 * - The manifest IS consumed by the backend guard on every request (0 DB queries on cache hit).
 *   Previously, each guard call ran 5-6 DB queries per permission; now it runs 1 Redis lookup
 *   for all permissions on a single request.
 */
@Injectable()
export class PermissionResolutionService {
  private readonly logger = new Logger(PermissionResolutionService.name)
  private readonly CACHE_TTL_SECONDS = 300 // 5 minutes

  constructor(
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly assignmentRepo: Repository<UserRoleAssignmentEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    @InjectRepository(StoreEntity)
    private readonly storeRepo: Repository<StoreEntity>,

    @InjectRepository(StoreFeatureEntity)
    private readonly storeFeatureRepo: Repository<StoreFeatureEntity>,

    @InjectRepository(UserPermissionOverrideEntity)
    private readonly overrideRepo: Repository<UserPermissionOverrideEntity>,

    private readonly cacheService: CacheService,
  ) { }

  // ─────────────────────────────────────────────────────────────────
  // Step 1 Helper: Feature Enabled Check (used standalone, not in hot path)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Determine whether a feature is active for a given store.
   * Checks overrides first, then plan fallback.
   *
   * NOTE: This method performs DB queries. It is NOT called from the
   * hot-path permission guard. The guard uses resolvePermissionsFromManifest()
   * which operates purely from the Redis-cached manifest.
   */
  async isFeatureEnabledForStore(storeId: string, featureSlug: string): Promise<boolean> {
    const planFeature = getPlanFeature(featureSlug)

    // Check specific sub-feature override first (e.g. "accounting")
    const overrideSpec = await this.storeFeatureRepo.findOne({
      where: { storeId, featureSlug },
    })
    if (overrideSpec !== null) {
      return overrideSpec.isEnabled
    }

    // Check parent plan feature override next (e.g. "finance")
    if (planFeature !== featureSlug) {
      const overridePlan = await this.storeFeatureRepo.findOne({
        where: { storeId, featureSlug: planFeature },
      })
      if (overridePlan !== null) {
        return overridePlan.isEnabled
      }
    }

    // Core features check
    if (isCoreFeature(featureSlug) || isCoreFeature(planFeature)) {
      return true
    }

    const store = await this.storeRepo.findOne({
      where: { id: storeId },
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })

    if (!store) return false

    const planFeatures = store.subscriptionPlan?.features ?? []
    return planFeatures.includes(planFeature) || planFeatures.includes(featureSlug)
  }

  // ─────────────────────────────────────────────────────────────────
  // Hot-Path Guard Entry Point — 0 DB queries on cache hit
  // ─────────────────────────────────────────────────────────────────

  /**
   * Resolve ALL required permissions for a single request using the cached manifest.
   *
   * This is the primary entry point for the PermissionsGuard. It fetches the
   * manifest once from Redis and checks all required permission slugs against it,
   * resulting in at most 1 Redis lookup per request (0 DB queries on cache hit).
   *
   * On a Redis cache miss, the manifest is built from DB (once) and cached for
   * CACHE_TTL_SECONDS (5 minutes), so subsequent requests are served from cache.
   *
   * @param userId              - The authenticated user
   * @param storeId            - The store scope
   * @param requiredPermissions - The array of permission slugs to check
   * @returns                   - The first denied permission slug, or null if all are allowed
   */
  async resolvePermissionsFromManifest(
    userId: string,
    storeId: string,
    requiredPermissions: string[],
    scope?: PermissionScopeContext,
  ): Promise<{ denied: string | null; manifest: PermissionManifest }> {
    const manifest = await this.resolvePermissionsManifest(userId, storeId, scope)
    const permissionSet = new Set(manifest.permissions)
    const featuresSet = new Set(manifest.featuresEnabled)

    for (const permSlug of requiredPermissions) {
      const featureSlug = permSlug.split(':')[0]
      const planFeature = getPlanFeature(featureSlug)

      // Step 1: Check if the feature is enabled for this store (from manifest)
      const featureEnabled = featuresSet.has(featureSlug) || featuresSet.has(planFeature)
      if (!featureEnabled) {
        this.logger.debug(`[DENY] Feature "${featureSlug}" not enabled for store ${storeId}`)
        return { denied: permSlug, manifest }
      }

      // Step 2+3: Check if the permission exists in the manifest permission set
      if (!permissionSet.has(permSlug)) {
        this.logger.debug(
          `[DENY] user=${userId} perm=${permSlug} store=${storeId} (manifest miss)`,
        )
        return { denied: permSlug, manifest }
      }

      this.logger.debug(`[ALLOW] user=${userId} perm=${permSlug} store=${storeId} (manifest hit)`)
    }

    return { denied: null, manifest }
  }

  // ─────────────────────────────────────────────────────────────────
  // Legacy single-permission check (kept for backward compatibility)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Resolve whether a user can perform a given permission in a store context.
   *
   * PERFORMANCE NOTE: This method now uses the Redis-cached manifest under the hood.
   * On a cache hit it runs 0 DB queries. On a cache miss it builds the manifest
   * (1 multi-query DB pass) and caches it for future requests.
   *
   * @param userId    - The user being checked
   * @param storeId  - The store scope
   * @param permSlug  - Permission slug in "feature:action" format (e.g. "payroll:approve")
   * @returns         - true if ALLOWED, false if DENIED
   */
  async resolvePermission(userId: string, storeId: string, permSlug: string): Promise<boolean> {
    const { denied } = await this.resolvePermissionsFromManifest(userId, storeId, [permSlug])
    return denied === null
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Manifest (for login response, UI gating & guard hot path)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Build the full permission manifest for a user.
   * Cached in Redis for CACHE_TTL_SECONDS (5 minutes).
   * Invalidated automatically on role assignment/revocation or feature changes.
   *
   * Frontend uses this for UI gating. Backend guard uses this for per-request
   * authorization (0 DB queries on cache hit).
   */
  async resolvePermissionsManifest(
    userId: string,
    storeId: string,
    scope?: PermissionScopeContext,
  ): Promise<PermissionManifest> {
    const scopeKey = scope?.branchId
      ? `:branch:${scope.branchId}`
      : scope?.warehouseId
        ? `:warehouse:${scope.warehouseId}`
        : ''
    const cacheKey = `rbac:manifest:${storeId}:${userId}${scopeKey}`
    const cached = await this.cacheService.getCache<PermissionManifest>(cacheKey)
    if (cached) {
      this.logger.debug(`[Cache HIT] RBAC manifest for user=${userId} store=${storeId}`)
      return cached
    }

    this.logger.debug(
      `[Cache MISS] Building RBAC manifest from DB for user=${userId} store=${storeId}`,
    )

    // ── Build enabled features list ───────────────────────────────────
    const store = await this.storeRepo.findOne({
      where: { id: storeId },
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })
    const planFeatures: string[] = store?.subscriptionPlan?.features ?? []

    // Merge with store-specific overrides
    const overrides = await this.storeFeatureRepo.find({ where: { storeId } })
    const overridesMap = new Map(overrides.map((o) => [o.featureSlug, o.isEnabled]))

    const featuresEnabledSet = new Set<string>()

    // Start with plan features, apply overrides
    for (const f of planFeatures) {
      if (overridesMap.get(f) !== false) {
        featuresEnabledSet.add(f)
      }
    }
    // Add any explicitly enabled overrides not in the plan (admin bonus features)
    for (const [f, isEnabled] of overridesMap.entries()) {
      if (isEnabled) {
        featuresEnabledSet.add(f)
      }
    }

    // Core features are always enabled unless explicitly disabled via override.
    for (const coreFeature of CORE_FEATURE_SLUGS) {
      if (overridesMap.get(coreFeature) !== false) {
        featuresEnabledSet.add(coreFeature)
      }
    }

    const featuresEnabled = Array.from(featuresEnabledSet)

    // ── Build permissions list ────────────────────────────────────────
    const effectivePermissions = await this.getEffectivePermissions(userId, storeId, scope)

    // Fetch active user-specific permission overrides
    const now = new Date()
    const userOverrides = await this.overrideRepo.find({
      where: { userId, storeId },
    })
    const activeUserOverrides = userOverrides.filter(
      (o) => !o.expiresAt || new Date(o.expiresAt) > now,
    )

    const permSet = new Set(effectivePermissions)

    // Apply overrides: ALLOW overrides add permissions, DENY overrides remove them
    for (const override of activeUserOverrides) {
      if (override.effect === OverrideEffect.ALLOW) {
        permSet.add(override.permissionSlug)
      } else if (override.effect === OverrideEffect.DENY) {
        permSet.delete(override.permissionSlug)
      }
    }

    // RBAC role permissions enable store features (for SubscriptionGuard + manifest).
    // Fixes staff with e.g. "hrm manager" when the base plan omits `hrm`.
    await this.ensureStoreFeaturesForPermissionSlugs(storeId, permSet, overridesMap)
    this.mergeRoleGrantedFeatures(permSet, featuresEnabledSet, overridesMap)

    // Include role permissions unless the feature is explicitly disabled for the store
    const permissions = Array.from(permSet).filter((p) => {
      const feat = p.split(':')[0]
      const planFeat = getPlanFeature(feat)
      if (overridesMap.get(feat) === false) return false
      if (overridesMap.get(planFeat) === false) return false
      return true
    })

    // User-effective features: store plan features the user can access via role permissions.
    // Used by login/me, JWT, and UI sidebar (same source as backend PermissionsGuard).
    const userFeaturesEnabled = this.deriveUserFeaturesEnabled(
      permissions,
      featuresEnabledSet,
    )

    const manifest: PermissionManifest = {
      featuresEnabled: userFeaturesEnabled,
      permissions: [...new Set(permissions)],
    }


    await this.cacheService.setCache(cacheKey, manifest, this.CACHE_TTL_SECONDS)
    return manifest
  }

  /**
   * Invalidate the cached manifest for a user.
   * Call this whenever a role is assigned/revoked or store features change.
   */
  async invalidateUserPermissionCache(userId: string, storeId: string): Promise<void> {
    const cacheKey = `rbac:manifest:${storeId}:${userId}`
    await this.cacheService.delCache(cacheKey)
    this.logger.debug(`[Cache] Invalidated permission manifest for user=${userId}`)
  }

  async invalidateStorePermissionCaches(): Promise<void> {
    await this.cacheService.delCacheByPattern('rbac:manifest:*')
    this.logger.log('[Cache] Invalidated all RBAC permission manifests')
  }

  /**
   * When a role grants permissions for a module, ensure the store has that feature
   * enabled (store_features). Idempotent — safe on every manifest build / role assign.
   */
  async ensureStoreFeaturesForPermissionSlugs(
    storeId: string,
    permissionSlugs: Iterable<string>,
    overridesMap?: Map<string, boolean>,
  ): Promise<void> {
    const slugsToEnable = this.collectFeatureSlugsFromPermissions(permissionSlugs)

    for (const slug of slugsToEnable) {
      if (overridesMap?.get(slug) === false) continue

      const existing = await this.storeFeatureRepo.findOne({
        where: { storeId, featureSlug: slug },
      })

      if (existing) {
        if (!existing.isEnabled) {
          existing.isEnabled = true
          existing.enabledAt = new Date()
          await this.storeFeatureRepo.save(existing)
        }
        overridesMap?.set(slug, true)
        continue
      }

      await this.storeFeatureRepo.save(
        this.storeFeatureRepo.create({
          storeId,
          featureSlug: slug,
          isEnabled: true,
          enabledAt: new Date(),
        }),
      )
      overridesMap?.set(slug, true)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Internal: Collect All Role-Based Permissions (flat, no inheritance)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Collect the union of all permissions granted to the user via their active role assignments.
   *
   * - Only non-expired assignments are considered.
   * - Roles are loaded flat (no parent chain walking).
   * - A user can hold multiple roles simultaneously; all are unioned together.
   */
  private assignmentMatchesScope(
    assignment: UserRoleAssignmentEntity,
    scope?: PermissionScopeContext,
  ): boolean {
    if (!scope?.branchId && !scope?.warehouseId) return true

    if (assignment.scopeType === RoleScopeType.GLOBAL || !assignment.scopeType) {
      return true
    }

    if (assignment.scopeType === RoleScopeType.BRANCH) {
      if (!scope.branchId) return true
      return assignment.scopeId === scope.branchId
    }

    if (assignment.scopeType === RoleScopeType.WAREHOUSE) {
      if (!scope.warehouseId) return true
      return assignment.scopeId === scope.warehouseId
    }

    return true
  }

  private async getEffectivePermissions(
    userId: string,
    storeId: string,
    scope?: PermissionScopeContext,
  ): Promise<Set<string>> {
    const now = new Date()

    const assignments = await this.assignmentRepo.find({
      where: { userId, storeId },
      relations: {
        role: {
          permissions: true,
        },
      },
    })

    const activeAssignments = assignments.filter(
      (a) =>
        (!a.expiresAt || new Date(a.expiresAt) > now) &&
        this.assignmentMatchesScope(a, scope),
    )

    if (activeAssignments.length === 0) return new Set()

    const permSet = new Set<string>()
    for (const assignment of activeAssignments) {
      for (const perm of assignment.role?.permissions ?? []) {
        permSet.add(perm.code)
      }
    }

    return permSet
  }

  /**
   * Features a user may access: store-enabled features that match at least one
   * granted permission (includes mapped plan slugs, e.g. accounting → finance).
   */
  private deriveUserFeaturesEnabled(
    permissions: string[],
    storeFeaturesEnabled: Set<string>,
  ): string[] {
    const userFeatures = new Set<string>()
    for (const p of permissions) {
      const feat = p.split(':')[0]
      const planFeat = getPlanFeature(feat)
      if (storeFeaturesEnabled.has(feat)) {
        userFeatures.add(feat)
      }
      if (storeFeaturesEnabled.has(planFeat)) {
        userFeatures.add(planFeat)
      }
    }
    return Array.from(userFeatures)
  }

  private collectFeatureSlugsFromPermissions(permissionSlugs: Iterable<string>): Set<string> {
    const slugs = new Set<string>()
    for (const code of permissionSlugs) {
      const feat = code.split(':')[0]
      if (!feat || isCoreFeature(feat)) continue
      slugs.add(feat)
      const planFeat = getPlanFeature(feat)
      if (!isCoreFeature(planFeat)) {
        slugs.add(planFeat)
      }
    }
    return slugs
  }

  /** Union role-granted module features into the store feature context for this user. */
  private mergeRoleGrantedFeatures(
    permSet: Set<string>,
    featuresEnabledSet: Set<string>,
    overridesMap: Map<string, boolean>,
  ): void {
    for (const slug of this.collectFeatureSlugsFromPermissions(permSet)) {
      if (overridesMap.get(slug) !== false) {
        featuresEnabledSet.add(slug)
      }
    }
  }
}
