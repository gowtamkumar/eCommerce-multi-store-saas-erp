import { OverrideEffect } from '@/common/enums/override-effect.enum'
import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { TenantFeatureEntity } from '@/modules/system/tenant/entities/tenant-feature.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'

export interface PermissionManifest {
  featuresEnabled: string[]
  permissions: string[]
}

/**
 * The core policy engine for the dynamic RBAC system.
 *
 * Implements the 5-step permission resolution algorithm:
 *
 * Step 1: Is the feature enabled for this tenant (subscription plan)?
 * Step 2: Is the feature enabled in tenant_features (admin toggle)?
 * Step 3: Does the user have an explicit DENY override? → DENY immediately
 * Step 4: Does the user have an explicit ALLOW override? → ALLOW immediately
 * Step 5: Does any assigned role (global + scoped) grant this permission? → ALLOW or DENY
 *
 * Key rules:
 * - DENY overrides ALWAYS win — even over role-granted permissions (AWS IAM pattern)
 * - Expired assignments and overrides are automatically ignored
 * - Role inheritance: a role's effective permissions include those of its parent chain
 * - Results are cached per-user with a 5-minute TTL and invalidated on role change
 */
@Injectable()
export class PermissionResolutionService {
  private readonly logger = new Logger(PermissionResolutionService.name)
  private readonly CACHE_TTL_SECONDS = 300 // 5 minutes

  constructor(
    @InjectRepository(TenantFeatureEntity)
    private readonly tenantFeatureRepo: Repository<TenantFeatureEntity>,

    @InjectRepository(UserPermissionOverrideEntity)
    private readonly overrideRepo: Repository<UserPermissionOverrideEntity>,

    @InjectRepository(UserRoleAssignmentEntity)
    private readonly assignmentRepo: Repository<UserRoleAssignmentEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Main Resolution Method
  // ─────────────────────────────────────────────────────────────────

  /**
   * Resolve whether a user can perform a given permission in a tenant context.
   *
   * @param userId       - The user being checked
   * @param tenantId     - The tenant scope (all queries are tenant-scoped)
   * @param permSlug     - The permission slug: "feature:action" (e.g. "payroll:approve")
   * @param scopeId      - Optional branch/warehouse ID for scoped permission checks
   * @returns            - true if ALLOWED, false if DENIED
   */
  async resolvePermission(
    userId: string,
    tenantId: string,
    permSlug: string,
    scopeId?: string,
  ): Promise<boolean> {
    const feature = permSlug.split(':')[0]

    // ── Step 1: Feature subscription check ───────────────────────────
    const tenantFeature = await this.tenantFeatureRepo.findOne({
      where: { tenantId, featureSlug: feature },
    })
    // If we have a TenantFeature record and it's disabled → deny
    // If no record exists at all, it means tenant was onboarded before this system → allow (permissive fallback)
    if (tenantFeature && !tenantFeature.isEnabled) {
      this.logger.debug(`[DENY] Feature "${feature}" disabled for tenant ${tenantId}`)
      return false
    }

    // ── Step 2: Active overrides for this user ────────────────────────
    const now = new Date()
    const overrides = await this.overrideRepo.find({
      where: { userId, tenantId, permissionSlug: permSlug },
    })
    const activeOverrides = overrides.filter(
      (o) => !o.expiresAt || new Date(o.expiresAt) > now,
    )

    // Step 3: Explicit DENY override → always wins
    if (activeOverrides.some((o) => o.effect === OverrideEffect.DENY)) {
      this.logger.debug(`[DENY] Explicit deny override for user=${userId} perm=${permSlug}`)
      return false
    }

    // Step 4: Explicit ALLOW override → granted without needing a role
    if (activeOverrides.some((o) => o.effect === OverrideEffect.ALLOW)) {
      this.logger.debug(`[ALLOW] Explicit allow override for user=${userId} perm=${permSlug}`)
      return true
    }

    // ── Step 5: Role-based check ──────────────────────────────────────
    const effectivePermissions = await this.getEffectivePermissions(userId, tenantId, scopeId)
    const allowed = effectivePermissions.has(permSlug)
    this.logger.debug(`[${allowed ? 'ALLOW' : 'DENY'}] Role-based check user=${userId} perm=${permSlug}`)
    return allowed
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Manifest (for login response & UI gating)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Build the full permission manifest for a user.
   * Returned at login and cached for 5 minutes.
   * Frontend uses this for UI gating ONLY — backend always re-validates per-request.
   */
  async resolvePermissionsManifest(
    userId: string,
    tenantId: string,
  ): Promise<PermissionManifest> {
    const cacheKey = `rbac:manifest:${tenantId}:${userId}`
    const cached = await this.cacheService.getCache<PermissionManifest>(cacheKey)
    if (cached) return cached

    // Get enabled features for this tenant
    const tenantFeatures = await this.tenantFeatureRepo.find({
      where: { tenantId, isEnabled: true },
    })
    const featuresEnabled = tenantFeatures.map((f) => f.featureSlug)

    // Get all permissions the user holds (via roles)
    const effectivePermissions = await this.getEffectivePermissions(userId, tenantId)

    // Get active ALLOW overrides and merge in
    const now = new Date()
    const allowOverrides = await this.overrideRepo.find({
      where: { userId, tenantId, effect: OverrideEffect.ALLOW },
    })
    const activeAllowOverrides = allowOverrides
      .filter((o) => !o.expiresAt || new Date(o.expiresAt) > now)
      .map((o) => o.permissionSlug)

    // Get active DENY overrides and remove from set
    const denyOverrides = await this.overrideRepo.find({
      where: { userId, tenantId, effect: OverrideEffect.DENY },
    })
    const activeDenySlugs = new Set(
      denyOverrides
        .filter((o) => !o.expiresAt || new Date(o.expiresAt) > now)
        .map((o) => o.permissionSlug),
    )

    // Merge and filter
    const permissions = [
      ...Array.from(effectivePermissions),
      ...activeAllowOverrides,
    ]
      .filter((p) => !activeDenySlugs.has(p)) // Remove denied
      .filter((p) => {
        // Only include permissions whose feature is enabled (or no feature record = fallback allow)
        const feat = p.split(':')[0]
        return featuresEnabled.includes(feat) || tenantFeatures.length === 0
      })

    const manifest: PermissionManifest = {
      featuresEnabled,
      permissions: [...new Set(permissions)], // deduplicate
    }

    await this.cacheService.setCache(cacheKey, manifest, this.CACHE_TTL_SECONDS)
    return manifest
  }

  /**
   * Invalidate the cached permission manifest for a user.
   * Must be called whenever a role is assigned/revoked or an override is added/removed.
   */
  async invalidateUserPermissionCache(userId: string, tenantId: string): Promise<void> {
    const cacheKey = `rbac:manifest:${tenantId}:${userId}`
    await this.cacheService.delCache(cacheKey)
    this.logger.debug(`[Cache] Invalidated permission manifest for user=${userId}`)
  }

  // ─────────────────────────────────────────────────────────────────
  // Internal: Collect All Role-Based Permissions
  // ─────────────────────────────────────────────────────────────────

  /**
   * Collect the union of all permissions granted to the user via their active role assignments.
   *
   * Includes:
   * - All GLOBAL role assignments for this tenant
   * - BRANCH/WAREHOUSE role assignments that match the requested scopeId
   * - Role inheritance: walks up the parentRoleId chain
   */
  private async getEffectivePermissions(
    userId: string,
    tenantId: string,
    scopeId?: string,
  ): Promise<Set<string>> {
    const now = new Date()

    // Fetch all active role assignments for this user in this tenant
    const assignments = await this.assignmentRepo.find({
      where: { userId, tenantId },
      relations: ['role', 'role.permissions'],
    })

    const activeAssignments = assignments.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt) > now,
    )

    // Filter by scope: include GLOBAL ones + scoped ones matching the requested scopeId
    const relevantAssignments = activeAssignments.filter((a) => {
      if (a.scopeType === RoleScopeType.GLOBAL) return true
      if (scopeId && a.scopeId === scopeId) return true
      return false
    })

    // Collect all roleIds to resolve (direct + any parent chains)
    const allRoleIds = new Set<string>()
    for (const assignment of relevantAssignments) {
      await this.collectRoleIdChain(assignment.roleId, allRoleIds)
    }

    if (allRoleIds.size === 0) return new Set()

    // Load all roles with permissions in one query
    const roles = await this.roleRepo.find({
      where: { id: In([...allRoleIds]) },
      relations: ['permissions'],
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

  /**
   * Walk the parent role chain recursively and collect all roleIds.
   * Guards against circular references with the visited set.
   */
  private async collectRoleIdChain(
    roleId: string,
    visited: Set<string>,
    depth = 0,
  ): Promise<void> {
    if (visited.has(roleId) || depth > 10) return // Guard against circular refs
    visited.add(roleId)

    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      select: ['id', 'parentRoleId'],
    })

    if (role?.parentRoleId) {
      await this.collectRoleIdChain(role.parentRoleId, visited, depth + 1)
    }
  }
}
