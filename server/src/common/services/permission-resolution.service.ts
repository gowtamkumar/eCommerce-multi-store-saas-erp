import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
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
 * - The manifest is for UI gating ONLY — the backend always re-validates on every request.
 */
@Injectable()
export class PermissionResolutionService {
  private readonly logger = new Logger(PermissionResolutionService.name)
  private readonly CACHE_TTL_SECONDS = 300 // 5 minutes

  constructor(
    @InjectRepository(TenantFeatureEntity)
    private readonly tenantFeatureRepo: Repository<TenantFeatureEntity>,

    @InjectRepository(UserRoleAssignmentEntity)
    private readonly assignmentRepo: Repository<UserRoleAssignmentEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,

    private readonly cacheService: CacheService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Step 1 Helper: Feature Enabled Check
  // ─────────────────────────────────────────────────────────────────

  /**
   * Determine whether a feature is active for a given tenant.
   *
   * Resolution order:
   *  1. Explicit row in tenant_features → authoritative (admin can enable features above plan)
   *  2. No row → check if subscription_plans.features[] includes the slug
   */
  async isFeatureEnabledForTenant(tenantId: string, featureSlug: string): Promise<boolean> {
    // Check explicit admin override first
    const override = await this.tenantFeatureRepo.findOne({
      where: { tenantId, featureSlug },
    })

    if (override !== null) {
      return override.isEnabled
    }

    // Fall back to plan-level feature list
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId },
      relations: ['subscriptionPlan'],
    })

    if (!tenant) return false

    const planFeatures = tenant.subscriptionPlan?.features ?? []
    return planFeatures.includes(featureSlug)
  }

  // ─────────────────────────────────────────────────────────────────
  // Main Resolution (used by PermissionsGuard per-request)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Resolve whether a user can perform a given permission in a tenant context.
   *
   * @param userId    - The user being checked
   * @param tenantId  - The tenant scope
   * @param permSlug  - Permission slug in "feature:action" format (e.g. "payroll:approve")
   * @returns         - true if ALLOWED, false if DENIED
   */
  async resolvePermission(userId: string, tenantId: string, permSlug: string): Promise<boolean> {
    const featureSlug = permSlug.split(':')[0]

    // ── Step 1: Is the feature enabled for this tenant? ───────────────
    const featureEnabled = await this.isFeatureEnabledForTenant(tenantId, featureSlug)
    if (!featureEnabled) {
      this.logger.debug(`[DENY] Feature "${featureSlug}" not enabled for tenant ${tenantId}`)
      return false
    }

    // ── Step 2 + 3: Does a role grant this permission? ────────────────
    const effectivePermissions = await this.getEffectivePermissions(userId, tenantId)
    const allowed = effectivePermissions.has(permSlug)

    this.logger.debug(
      `[${allowed ? 'ALLOW' : 'DENY'}] user=${userId} perm=${permSlug} tenant=${tenantId}`,
    )
    return allowed
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Manifest (for login response & UI gating)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Build the full permission manifest for a user.
   * Returned at login and cached for 5 minutes.
   *
   * Frontend uses this for UI gating ONLY.
   * Backend always re-validates per-request via resolvePermission().
   */
  async resolvePermissionsManifest(userId: string, tenantId: string): Promise<PermissionManifest> {
    const cacheKey = `rbac:manifest:${tenantId}:${userId}`
    const cached = await this.cacheService.getCache<PermissionManifest>(cacheKey)
    if (cached) return cached

    // ── Build enabled features list ───────────────────────────────────
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenantId },
      relations: ['subscriptionPlan'],
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

    const featuresEnabled = Array.from(featuresEnabledSet)

    // ── Build permissions list ────────────────────────────────────────
    const effectivePermissions = await this.getEffectivePermissions(userId, tenantId)

    // Only include permissions whose feature is enabled for this tenant
    const permissions = Array.from(effectivePermissions).filter((p) => {
      const feat = p.split(':')[0]
      return featuresEnabledSet.has(feat)
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
      relations: ['role', 'role.permissions'],
    })

    // Filter out expired assignments
    const activeAssignments = assignments.filter(
      (a) => !a.expiresAt || new Date(a.expiresAt) > now,
    )

    if (activeAssignments.length === 0) return new Set()

    // Collect all unique roleIds from active assignments
    const roleIds = [...new Set(activeAssignments.map((a) => a.roleId))]

    // Load all roles with their permissions in a single query
    const roles = await this.roleRepo.find({
      where: { id: In(roleIds) },
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
}
