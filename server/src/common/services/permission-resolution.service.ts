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
import { TenantFeatureEntity } from '@/modules/system/tenant/entities/tenant-feature.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

export interface PermissionManifest {
  featuresEnabled: string[]
  permissions: string[]
}

/**
 * The core policy engine — simplified 3-step permission resolution.
 *
 * Step 1: Is the feature enabled for this tenant?
 *         → Check tenant_features (admin override) first.
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

    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,

    @InjectRepository(TenantFeatureEntity)
    private readonly tenantFeatureRepo: Repository<TenantFeatureEntity>,

    @InjectRepository(UserPermissionOverrideEntity)
    private readonly overrideRepo: Repository<UserPermissionOverrideEntity>,

    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Step 1 Helper: Feature Enabled Check (used standalone, not in hot path)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Determine whether a feature is active for a given tenant.
   * Checks overrides first, then plan fallback.
   *
   * NOTE: This method performs DB queries. It is NOT called from the
   * hot-path permission guard. The guard uses resolvePermissionsFromManifest()
   * which operates purely from the Redis-cached manifest.
   */
  async isFeatureEnabledForTenant(tenantId: string, featureSlug: string): Promise<boolean> {
    const planFeature = getPlanFeature(featureSlug)

    // Check specific sub-feature override first (e.g. "accounting")
    const overrideSpec = await this.tenantFeatureRepo.findOne({
      where: { tenantId, featureSlug },
    })
    if (overrideSpec !== null) {
      return overrideSpec.isEnabled
    }

    // Check parent plan feature override next (e.g. "finance")
    if (planFeature !== featureSlug) {
      const overridePlan = await this.tenantFeatureRepo.findOne({
        where: { tenantId, featureSlug: planFeature },
      })
      if (overridePlan !== null) {
        return overridePlan.isEnabled
      }
    }

    // Core features check
    if (isCoreFeature(featureSlug) || isCoreFeature(planFeature)) {
      return true
    }

    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId },
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })

    if (!tenant) return false

    const planFeatures = tenant.subscriptionPlan?.features ?? []
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
   * @param tenantId            - The tenant scope
   * @param requiredPermissions - The array of permission slugs to check
   * @returns                   - The first denied permission slug, or null if all are allowed
   */
  async resolvePermissionsFromManifest(
    userId: string,
    tenantId: string,
    requiredPermissions: string[],
  ): Promise<{ denied: string | null; manifest: PermissionManifest }> {
    // Load the cached manifest (or build it if not cached). This is at most 1 Redis
    // operation for the entire request regardless of how many permissions are required.
    const manifest = await this.resolvePermissionsManifest(userId, tenantId)
    const permissionSet = new Set(manifest.permissions)
    const featuresSet = new Set(manifest.featuresEnabled)

    for (const permSlug of requiredPermissions) {
      const featureSlug = permSlug.split(':')[0]
      const planFeature = getPlanFeature(featureSlug)

      // Step 1: Check if the feature is enabled for this tenant (from manifest)
      const featureEnabled = featuresSet.has(featureSlug) || featuresSet.has(planFeature)
      if (!featureEnabled) {
        this.logger.debug(`[DENY] Feature "${featureSlug}" not enabled for tenant ${tenantId}`)
        return { denied: permSlug, manifest }
      }

      // Step 2+3: Check if the permission exists in the manifest permission set
      if (!permissionSet.has(permSlug)) {
        this.logger.debug(
          `[DENY] user=${userId} perm=${permSlug} tenant=${tenantId} (manifest miss)`,
        )
        return { denied: permSlug, manifest }
      }

      this.logger.debug(`[ALLOW] user=${userId} perm=${permSlug} tenant=${tenantId} (manifest hit)`)
    }

    return { denied: null, manifest }
  }

  // ─────────────────────────────────────────────────────────────────
  // Legacy single-permission check (kept for backward compatibility)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Resolve whether a user can perform a given permission in a tenant context.
   *
   * PERFORMANCE NOTE: This method now uses the Redis-cached manifest under the hood.
   * On a cache hit it runs 0 DB queries. On a cache miss it builds the manifest
   * (1 multi-query DB pass) and caches it for future requests.
   *
   * @param userId    - The user being checked
   * @param tenantId  - The tenant scope
   * @param permSlug  - Permission slug in "feature:action" format (e.g. "payroll:approve")
   * @returns         - true if ALLOWED, false if DENIED
   */
  async resolvePermission(userId: string, tenantId: string, permSlug: string): Promise<boolean> {
    const { denied } = await this.resolvePermissionsFromManifest(userId, tenantId, [permSlug])
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
  async resolvePermissionsManifest(userId: string, tenantId: string): Promise<PermissionManifest> {
    const cacheKey = `rbac:manifest:${tenantId}:${userId}`
    const cached = await this.cacheService.getCache<PermissionManifest>(cacheKey)
    if (cached) {
      this.logger.debug(`[Cache HIT] RBAC manifest for user=${userId} tenant=${tenantId}`)
      return cached
    }

    this.logger.debug(
      `[Cache MISS] Building RBAC manifest from DB for user=${userId} tenant=${tenantId}`,
    )

    // ── Build enabled features list ───────────────────────────────────
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId },
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })
    const planFeatures: string[] = tenant?.subscriptionPlan?.features ?? []

    // Merge with tenant-specific overrides
    const overrides = await this.tenantFeatureRepo.find({ where: { tenantId } })
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
    const effectivePermissions = await this.getEffectivePermissions(userId, tenantId)

    // Fetch active user-specific permission overrides
    const now = new Date()
    const userOverrides = await this.overrideRepo.find({
      where: { userId, tenantId },
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

    // Only include permissions whose feature is enabled for this tenant
    const permissions = Array.from(permSet).filter((p) => {
      const feat = p.split(':')[0]
      const planFeat = getPlanFeature(feat)
      return featuresEnabledSet.has(feat) || featuresEnabledSet.has(planFeat)
    })

    const manifest: PermissionManifest = {
      featuresEnabled,
      permissions: [...new Set(permissions)],
    }

    await this.cacheService.setCache(cacheKey, manifest, this.CACHE_TTL_SECONDS)
    return manifest
  }

  /**
   * Invalidate the cached manifest for a user.
   * Call this whenever a role is assigned/revoked or tenant features change.
   */
  async invalidateUserPermissionCache(userId: string, tenantId: string): Promise<void> {
    const cacheKey = `rbac:manifest:${tenantId}:${userId}`
    await this.cacheService.delCache(cacheKey)
    this.logger.debug(`[Cache] Invalidated permission manifest for user=${userId}`)
  }

  async invalidateTenantPermissionCaches(): Promise<void> {
    await this.cacheService.delCacheByPattern('rbac:manifest:*')
    this.logger.log('[Cache] Invalidated all RBAC permission manifests')
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
  private async getEffectivePermissions(userId: string, tenantId: string): Promise<Set<string>> {
    const now = new Date()

    // Load all role assignments for this user in this tenant
    const assignments = await this.assignmentRepo.find({
      where: { userId, tenantId },
      relations: {
        role: {
          permissions: true,
        },
      },
    })

    // Filter out expired assignments
    const activeAssignments = assignments.filter((a) => !a.expiresAt || new Date(a.expiresAt) > now)

    if (activeAssignments.length === 0) return new Set()

    // Collect all unique roleIds from active assignments
    const roleIds = [...new Set(activeAssignments.map((a) => a.roleId))]

    // Load all roles with their permissions in a single query
    const roles = await this.roleRepo.find({
      where: { id: In(roleIds) },
      relations: {
        permissions: true,
      },
    })

    // Union all permission slugs
    const permSet = new Set<string>()
    for (const role of roles) {
      for (const perm of role.permissions ?? []) {
        permSet.add(perm.code)
      }
    }

    return permSet
  }
}
