import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RoleScopeType } from '@/common/enums/role-scope-type.enum'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { SubscriptionPlanService } from '@/modules/system/subscription-plan/subscription-plan.service'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { DataSource } from 'typeorm'
import {
  InvalidCustomDomainError,
  generateVerificationToken,
  normalizeCustomDomain,
  verifyDomainOwnership,
} from './custom-domain.util'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantOverviewResponseDto } from './dto/tenant-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { TenantEntity } from './entities/tenant.entity'
import { TenantFeatureEntity } from './entities/tenant-feature.entity'
import { TenantRepository } from './tenant.repository'
import { AccountEntity } from '@/modules/admin/operations/finance/accounting/entities/account.entity'
import { DEFAULT_CHART_OF_ACCOUNTS } from '@/modules/admin/operations/finance/accounting/constants/default-coa'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { PosRegisterEntity } from '@/modules/admin/sales/pos/entities/pos-register.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'

export interface CreateTenantResponseDto {
  tenant: TenantEntity
  admin: {
    id: string
    name: string
    username: string
    email: string
  }
}

export interface VerificationInstructions {
  recordType: 'TXT'
  recordHost: string
  recordValue: string
  ttlHint: number
}

import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name)
  private readonly CACHE_PREFIX = 'tenant:'

  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly roleManagementService: RoleManagementService,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Creates a new tenant with associated admin user and initial settings.
   * Uses a transaction to ensure atomicity.
   */
  async createTenant(createTenantDto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    this.logger.log(`Creating tenant: ${createTenantDto.storeName}`)

    const {
      storeName,
      subdomain,
      planId,
      name,
      username,
      email,
      password,
      subscriptionBillingCycle,
    } = createTenantDto

    // 1. Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findBySubdomain(subdomain)
    if (existingTenant) {
      throw new ConflictException(`Subdomain "${subdomain}" is already taken`)
    }

    // 2. Prepare subscription details
    const now = new Date()
    let subscriptionPlan = null
    let billingCycle = subscriptionBillingCycle || SubscriptionBillingCycle.MONTHLY

    if (planId) {
      subscriptionPlan = await this.subscriptionPlanService.findOneSubscriptionPlan(planId)
      if (subscriptionPlan && !subscriptionBillingCycle) {
        billingCycle = subscriptionPlan.billingCycle
      }
    }

    const trialEndsAt = new Date()
    const trialDays = subscriptionPlan ? (subscriptionPlan.trialPeriodDays ?? 14) : 14
    trialEndsAt.setDate(now.getDate() + trialDays)

    // 3. Execute creation in a transaction
    const result = await this.dataSource.transaction(async (manager) => {
      const tenantRepo = manager.withRepository(this.tenantRepository['repo'])
      const userRepo = manager.getRepository(this.userRepository['repo'].target)

      // Create tenant
      const tenant = tenantRepo.create({
        storeName,
        subdomain,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        subscriptionBillingCycle: billingCycle,
        subscriptionStartsAt: now,
        subscriptionEndsAt: trialEndsAt,
        subscriptionPlan,
      })
      const savedTenant = await tenantRepo.save(tenant)

      // Create default Main Branch
      const branchRepo = manager.getRepository(BranchEntity)
      const defaultBranch = branchRepo.create({
        name: 'Main Branch',
        code: `MAIN-${subdomain.toUpperCase()}`,
        tenantId: savedTenant.id,
        isActive: true,
      })
      const savedBranch = await branchRepo.save(defaultBranch)

      // Create default Warehouse
      const warehouseRepo = manager.getRepository(WarehouseEntity)
      const defaultWarehouse = warehouseRepo.create({
        name: 'Main Warehouse',
        code: `WH-${subdomain.toUpperCase()}`,
        tenantId: savedTenant.id,
        branchId: savedBranch.id,
        isActive: true,
      })
      await warehouseRepo.save(defaultWarehouse)

      // Create default POS Register / Cash Drawer
      const posRegisterRepo = manager.getRepository(PosRegisterEntity)
      const defaultRegister = posRegisterRepo.create({
        name: 'Main Till',
        branchId: savedBranch.id,
        tenantId: savedTenant.id,
      })
      await posRegisterRepo.save(defaultRegister)

      // Create admin user linked to Main Branch
      const hashedPassword = await bcrypt.hash(password, 10)
      const verificationToken = crypto.randomBytes(32).toString('hex')

      const user = userRepo.create({
        name,
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN, // Keep for backward compat
        tenantId: savedTenant.id,
        branch: savedBranch,
        isAdmin: false,
        emailVerificationToken: verificationToken,
      })
      const savedUser = await userRepo.save(user)

      // Link user to tenant
      savedTenant.userId = savedUser.id
      await tenantRepo.save(savedTenant)

      // Seed default roles and assign Super Admin to the new user
      const superAdminRole = await this.roleManagementService.seedSuperAdminRole(
        savedTenant.id,
        manager,
      )
      await this.roleManagementService.seedDefaultRoles(savedTenant.id, manager)

      const assignmentRepo = manager.getRepository(UserRoleAssignmentEntity)
      await assignmentRepo.save(
        assignmentRepo.create({
          userId: savedUser.id,
          roleId: superAdminRole.id,
          tenantId: savedTenant.id,
          scopeType: RoleScopeType.GLOBAL,
          assignedBy: savedUser.id,
        }),
      )

      // Tenant features are resolved dynamically from the Subscription Plan.

      // Initialize default Chart of Accounts (COA) for this new tenant
      const accountRepo = manager.getRepository(AccountEntity)
      const accounts = DEFAULT_CHART_OF_ACCOUNTS.map((coa) =>
        accountRepo.create({
          ...coa,
          tenantId: savedTenant.id,
        }),
      )
      await accountRepo.save(accounts)

      return {
        tenant: savedTenant,
        admin: {
          id: savedUser.id,
          name: savedUser.name,
          username: savedUser.username,
          email: savedUser.email,
        },
        verificationToken,
      }
    })

    // 4. Parallelize non-critical initialization tasks (after transaction has committed)
    await Promise.all([
      // Initialize Site Settings
      this.settingsService.createSetting({ tenantId: result.tenant.id } as RequestContextDto, {
        userId: result.admin.id,
        brandName: storeName,
        siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
        contactEmail: email,
      }),
      // Send verification email (fire and forget or handle errors gracefully)
      this.mailService
        .sendVerificationEmail(email, result.verificationToken, result.tenant.id)
        .catch((err) => this.logger.error(`Failed to send verification email for ${email}:`, err)),
      // Trigger Global Super Admin Notification
      this.notificationService
        .createNotification(
          {
            title: 'New Tenant Signup',
            message: `A new store '${storeName}' (${subdomain}) has registered on the platform.`,
            type: 'INFO',
            link: `/admin/system/tenants/${result.tenant.id}`,
            userId: null as any,
          },
          null,
        )
        .catch((err) =>
          this.logger.error(`Failed to trigger super admin tenant notification:`, err),
        ),
    ])

    return {
      tenant: result.tenant,
      admin: result.admin,
    }
  }

  async findAllTenants(): Promise<TenantEntity[]> {
    const cacheKey = `${this.CACHE_PREFIX}all`
    const cached = await this.cacheService.getCache<TenantEntity[]>(cacheKey)
    if (cached) return cached

    const tenants = await this.tenantRepository.findAllSorted()
    await this.cacheService.setCache(cacheKey, tenants, 3600) // Cache for 1 hour
    return tenants
  }

  async findOneTenants(id: string): Promise<TenantEntity> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`
    const cached = await this.cacheService.getCache<TenantEntity>(cacheKey)
    if (cached) return cached

    const tenant = await this.tenantRepository.findByIdWithRelations(id)
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`)
    }

    await this.cacheService.setCache(cacheKey, tenant, 3600)
    return tenant
  }

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    const cacheKey = `${this.CACHE_PREFIX}subdomain:${subdomain}`
    const cached = await this.cacheService.getCache<TenantEntity>(cacheKey)
    if (cached) return cached

    const tenant = await this.tenantRepository.findBySubdomain(subdomain)
    if (tenant) {
      await this.cacheService.setCache(cacheKey, tenant, 3600)
    }
    return tenant
  }

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    const cacheKey = `${this.CACHE_PREFIX}customdomain:${customDomain}`
    const cached = await this.cacheService.getCache<TenantEntity>(cacheKey)
    if (cached) return cached

    const tenant = await this.tenantRepository.findByCustomDomain(customDomain)
    // Only cache ACTIVE attachments — otherwise a tenant could DOS another
    // tenant's hostname by claiming it and poisoning the cache before
    // verification completes.
    if (tenant && tenant.customDomainStatus === CustomDomainStatus.ACTIVE) {
      await this.cacheService.setCache(cacheKey, tenant, 3600)
    }
    return tenant
  }

  async lookupTenant(subdomain?: string, customDomain?: string): Promise<TenantEntity> {
    let tenant: TenantEntity | null = null

    if (customDomain) {
      tenant = await this.findByCustomDomain(customDomain)
      // Defense-in-depth: never serve a tenant by a not-yet-verified custom
      // domain. Without this, an attacker who reserved a domain on someone
      // else's account could be served their storefront once their DNS
      // accidentally pointed here.
      if (tenant && tenant.customDomainStatus !== CustomDomainStatus.ACTIVE) {
        tenant = null
      }
    }

    // Fallback to subdomain check if custom domain is not found or not provided
    if (!tenant && subdomain) {
      tenant = await this.findBySubdomain(subdomain)
    }

    if (!tenant) {
      throw new NotFoundException('Store not found. Please check the domain or subdomain.')
    }
    return tenant
  }

  /**
   * Step 1 of the custom-domain flow: the tenant tells us which hostname they
   * intend to point at us. We:
   *   - normalise the hostname
   *   - ensure no other tenant already claims it
   *   - reset status to PENDING
   *   - issue a fresh verification token
   * The frontend then displays the TXT record we expect at
   * `_omnicart-verify.<domain>` and the tenant proves ownership via DNS.
   */
  async requestCustomDomain(
    id: string,
    customDomainInput: string,
  ): Promise<TenantEntity & { verificationInstructions: VerificationInstructions }> {
    let normalized: string
    try {
      normalized = normalizeCustomDomain(customDomainInput)
    } catch (err: any) {
      if (err instanceof InvalidCustomDomainError) {
        throw new BadRequestException(err.message)
      }
      throw err
    }

    const tenant = await this.findOneTenants(id)

    // Block claims of a domain owned by someone else.
    const existing = await this.tenantRepository.findByCustomDomain(normalized)
    if (existing && existing.id !== id) {
      throw new ConflictException('Custom domain is already attached to another store')
    }

    const verificationToken = generateVerificationToken()

    const updated = await this.tenantRepository.updateAndSave(tenant, {
      customDomain: normalized,
      customDomainStatus: CustomDomainStatus.PENDING,
      customDomainVerifiedAt: null,
      customDomainVerificationToken: verificationToken,
    })
    await this.invalidateTenantCache(id, tenant.subdomain, normalized)
    if (tenant.customDomain && tenant.customDomain !== normalized) {
      await this.invalidateTenantCache(id, tenant.subdomain, tenant.customDomain)
    }

    const instructions: VerificationInstructions = {
      recordType: 'TXT',
      recordHost: `_omnicart-verify.${normalized}`,
      recordValue: verificationToken,
      ttlHint: 300,
    }

    return Object.assign(updated, { verificationInstructions: instructions })
  }

  /**
   * Step 2 of the custom-domain flow: we resolve the TXT record at
   * `_omnicart-verify.<domain>` and compare it against the token we issued.
   * Only on an exact match do we flip the status to ACTIVE. Anything else
   * (NXDOMAIN, mismatch, missing token) returns an actionable error and
   * leaves the row PENDING so the user can retry.
   */
  async verifyCustomDomain(id: string): Promise<TenantEntity> {
    const tenant = await this.findOneTenants(id)
    if (!tenant.customDomain) {
      throw new BadRequestException('No custom domain configured to verify')
    }
    if (!tenant.customDomainVerificationToken) {
      throw new BadRequestException(
        'Verification token missing — request a new custom domain assignment first',
      )
    }

    const result = await verifyDomainOwnership(
      tenant.customDomain,
      tenant.customDomainVerificationToken,
    )

    if (!result.verified) {
      this.logger.warn(
        `Custom domain TXT verification failed tenant=${id} domain=${tenant.customDomain} reason=${result.error ?? 'mismatch'}`,
      )
      throw new BadRequestException(
        result.error
          ? `Verification failed: ${result.error}`
          : 'TXT record did not match expected verification token',
      )
    }

    const updated = await this.tenantRepository.updateAndSave(tenant, {
      customDomainStatus: CustomDomainStatus.ACTIVE,
      customDomainVerifiedAt: new Date(),
      // Burn the token so it can't be reused after a domain detach/attach cycle.
      customDomainVerificationToken: null,
    })
    await this.invalidateTenantCache(id, tenant.subdomain, tenant.customDomain)
    return updated
  }

  async detachCustomDomain(id: string): Promise<TenantEntity> {
    const tenant = await this.findOneTenants(id)
    const oldDomain = tenant.customDomain
    const updated = await this.tenantRepository.updateAndSave(tenant, {
      customDomain: null,
      customDomainStatus: CustomDomainStatus.PENDING,
      customDomainVerifiedAt: null,
      customDomainVerificationToken: null,
    } as any)
    await this.invalidateTenantCache(id, tenant.subdomain, oldDomain)
    return updated
  }

  async updateTenantStatus(id: string, status: string): Promise<TenantEntity> {
    const tenant = await this.findOneTenants(id)
    const updated = await this.tenantRepository.updateAndSave(tenant, {
      status: status as TenantStatus,
    })
    await this.invalidateTenantCache(id, tenant.subdomain, tenant.customDomain)
    return updated
  }

  async tenantOverview(): Promise<TenantOverviewResponseDto> {
    const stats = await this.tenantRepository.getTenantStats()
    return {
      totalTenants: stats.total,
      activeTenants: stats.active,
      suspendedTenants: stats.suspended,
      archivedTenants: stats.archived,
    }
  }

  /**
   * Efficiently gather analytics for all tenants using bulk aggregation queries.
   * Fixes the N+1 query problem in SuperAdmin analytics.
   */
  async getBulkTenantAnalytics(): Promise<any[]> {
    const tenants = await this.findAllTenants()

    // Fetch counts for all tenants in parallel using optimized group-by queries
    const [userCounts, productCounts, orderCounts, pageCounts] = await Promise.all([
      this.getCountsGroupedByTenant('users'),
      this.getCountsGroupedByTenant('products'),
      this.getCountsGroupedByTenant('orders'),
      this.getCountsGroupedByTenant('pages'),
    ])

    return tenants.map((tenant) => ({
      id: tenant.id,
      storeName: tenant.storeName,
      subdomain: tenant.subdomain,
      subscriptionPlan: tenant.subscriptionPlan,
      status: tenant.status,
      stats: {
        users: userCounts[tenant.id] || 0,
        products: productCounts[tenant.id] || 0,
        orders: orderCounts[tenant.id] || 0,
        pages: pageCounts[tenant.id] || 0,
        traffic: 0, // Traffic stats could be added here if needed
      },
    }))
  }

  /**
   * Get detailed analytics for a single tenant efficiently.
   */
  async getDetailedAnalytics(id: string): Promise<any> {
    const tenant = await this.findOneTenants(id)
    const [users, products, orders, pages] = await Promise.all([
      this.userRepository.countByTenant(id),
      this.dataSource.query('SELECT COUNT(*) FROM products WHERE tenant_id = $1', [id]),
      this.dataSource.query('SELECT COUNT(*) FROM orders WHERE tenant_id = $1', [id]),
      this.dataSource.query('SELECT COUNT(*) FROM pages WHERE tenant_id = $1', [id]),
    ])

    return {
      tenantInfo: {
        id: tenant.id,
        storeName: tenant.storeName,
        subdomain: tenant.subdomain,
      },
      counts: {
        users,
        products: parseInt(products[0].count, 10),
        orders: parseInt(orders[0].count, 10),
        pages: parseInt(pages[0].count, 10),
      },
      topPages: [], // Placeholder for now
    }
  }

  private async getCountsGroupedByTenant(tableName: string): Promise<Record<string, number>> {
    const results = await this.dataSource.query(
      `SELECT tenant_id, COUNT(*) as count FROM ${tableName} WHERE tenant_id IS NOT NULL GROUP BY tenant_id`,
    )
    return results.reduce((acc, row) => {
      acc[row.tenant_id] = parseInt(row.count, 10)
      return acc
    }, {})
  }

  async updateTenantPlan(id: string, planId: string): Promise<TenantEntity> {
    this.logger.log(`Updating tenant plan for tenant ID: ${id} to plan ID: ${planId}`)

    const tenant = await this.findOneTenants(id)
    const newPlan = await this.subscriptionPlanService.findOneSubscriptionPlan(planId)
    if (!newPlan) {
      throw new NotFoundException(`Subscription plan with ID "${planId}" not found`)
    }

    return await this.dataSource.transaction(async (manager) => {
      const tenantRepo = manager.getRepository(TenantEntity)

      // 1. Update the tenant's plan relation
      tenant.subscriptionPlanId = planId
      tenant.subscriptionPlan = newPlan
      const updatedTenant = await tenantRepo.save(tenant)

      // 2. Clear tenant cache
      await this.invalidateTenantCache(id, tenant.subdomain, tenant.customDomain)

      // 3. Invalidate permission manifest caches for all tenant users
      try {
        const members = await this.userRepository.findTeamMembers(id)
        for (const member of members) {
          const cacheKey = `rbac:manifest:${id}:${member.id}`
          await this.cacheService.delCache(cacheKey)
        }
      } catch (err) {
        this.logger.error(`Failed to invalidate team member permission caches: ${err.message}`)
      }

      return updatedTenant
    })
  }

  isSubscriptionExpired(tenant: TenantEntity): boolean {
    return tenant.isExpired
  }

  async getTenantFeatures(tenantId: string) {
    const tenant = await this.findOneTenants(tenantId)
    if (!tenant) throw new NotFoundException('Tenant not found')

    // 1. Get all unique features across all subscription plans
    const plans = await this.subscriptionPlanService.findAllSubscriptionPlans()
    const allFeaturesSet = new Set<string>()
    for (const p of plans) {
      for (const f of p.features || []) {
        allFeaturesSet.add(f)
      }
    }

    // 2. Get active plan features for this tenant
    const planFeatures = new Set<string>(tenant.subscriptionPlan?.features || [])

    // 3. Get existing overrides in DB
    const overrides = await this.dataSource.getRepository(TenantFeatureEntity).find({
      where: { tenantId },
    })
    const overridesMap = new Map(overrides.map((o) => [o.featureSlug, o]))

    // Add any overrides that might not be in the plans features list
    for (const o of overrides) {
      allFeaturesSet.add(o.featureSlug)
    }

    // 4. Build output list
    return Array.from(allFeaturesSet).map((slug) => {
      const override = overridesMap.get(slug)
      const isPlanFeature = planFeatures.has(slug)

      // Calculate effective status
      let isEnabled = isPlanFeature
      let isOverridden = false

      if (override) {
        isOverridden = true
        isEnabled = override.isEnabled
      }

      return {
        slug,
        isPlanFeature,
        isOverridden,
        isEnabled,
        overrideValue: override ? override.isEnabled : null,
        updatedAt: override ? override.updatedAt : null,
      }
    })
  }

  async updateTenantFeatureOverride(
    tenantId: string,
    featureSlug: string,
    overrideValue: boolean | null,
  ) {
    const tenant = await this.findOneTenants(tenantId)
    if (!tenant) throw new NotFoundException('Tenant not found')

    const featureRepo = this.dataSource.getRepository(TenantFeatureEntity)

    if (overrideValue === null) {
      // Reset: delete override record
      await featureRepo.delete({ tenantId, featureSlug })
    } else {
      // Upsert override record
      let override = await featureRepo.findOne({ where: { tenantId, featureSlug } })
      if (override) {
        override.isEnabled = overrideValue
        override.updatedAt = new Date()
        await featureRepo.save(override)
      } else {
        override = featureRepo.create({
          tenantId,
          featureSlug,
          isEnabled: overrideValue,
          enabledAt: overrideValue ? new Date() : null,
        })
        await featureRepo.save(override)
      }
    }

    // Clear tenant cache
    await this.invalidateTenantCache(tenantId, tenant.subdomain, tenant.customDomain)

    // Invalidate permission manifest caches for all tenant users
    try {
      const members = await this.userRepository.findTeamMembers(tenantId)
      for (const member of members) {
        const cacheKey = `rbac:manifest:${tenantId}:${member.id}`
        await this.cacheService.delCache(cacheKey)
      }
    } catch (err) {
      this.logger.error(`Failed to invalidate team member permission caches: ${err.message}`)
    }

    return { success: true }
  }

  private async invalidateTenantCache(id: string, subdomain?: string, customDomain?: string) {
    const keys = [`${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}id:${id}`]
    if (subdomain) keys.push(`${this.CACHE_PREFIX}subdomain:${subdomain}`)
    if (customDomain) keys.push(`${this.CACHE_PREFIX}customdomain:${customDomain}`)

    await Promise.all(keys.map((key) => this.cacheService.delCache(key)))
  }
}
