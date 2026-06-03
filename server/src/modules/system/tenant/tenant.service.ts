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
import { TenantDomainEntity } from './entities/tenant-domain.entity'
import { TenantSubscriptionEntity } from './entities/tenant-subscription.entity'
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

  private hydrateTenant(tenant: TenantEntity | null): TenantEntity | null {
    return tenant ? Object.assign(new TenantEntity(), tenant) : null
  }

  private hydrateTenants(tenants: TenantEntity[]): TenantEntity[] {
    return tenants.map((tenant) => Object.assign(new TenantEntity(), tenant))
  }

  /**
   * Creates a new tenant with associated admin user and initial settings.
   * Uses a transaction to ensure atomicity.
   */
  async createTenant(createTenantDto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    this.logger.log(`Creating tenant: ${createTenantDto.storeName}`)

    const {
      storeName,
      subdomain: rawSubdomain,
      planId,
      name,
      username,
      email,
      password,
      subscriptionBillingCycle,
    } = createTenantDto

    const subdomain = rawSubdomain.trim().toLowerCase()

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
    } else {
      // No plan chosen at signup → default to the cheapest active plan (Starter/free)
      // so the trial subscription always references a real plan.
      const activePlans = await this.subscriptionPlanService.findActiveSubscriptionPlans()
      subscriptionPlan = activePlans[0] ?? null
    }

    if (!subscriptionPlan) {
      throw new BadRequestException(
        'No subscription plan is available. Please configure at least one active plan before onboarding tenants.',
      )
    }

    if (!subscriptionBillingCycle) {
      billingCycle = subscriptionPlan.billingCycle
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
      })
      const savedTenant = await tenantRepo.save(tenant)

      // Create initial trial subscription
      const subRepo = manager.getRepository(TenantSubscriptionEntity)
      const sub = subRepo.create({
        tenantId: savedTenant.id,
        subscriptionPlanId: subscriptionPlan.id,
        status: SubscriptionStatus.TRIAL,
        billingCycle: billingCycle,
        startsAt: now,
        endsAt: trialEndsAt,
      })
      const savedSub = await subRepo.save(sub)

      // Associate with tenant
      savedTenant.activeSubscriptionId = savedSub.id
      savedTenant.activeSubscription = savedSub
      await tenantRepo.save(savedTenant)

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
    if (cached) return this.hydrateTenants(cached)

    const tenants = await this.tenantRepository.findAllSorted()
    await this.cacheService.setCache(cacheKey, tenants, 3600) // Cache for 1 hour
    return tenants
  }

  async findOneTenants(id: string): Promise<TenantEntity> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`
    const cached = await this.cacheService.getCache<TenantEntity>(cacheKey)
    const hydratedCached = this.hydrateTenant(cached)
    if (hydratedCached) return hydratedCached

    const tenant = await this.tenantRepository.findByIdWithRelations(id)
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`)
    }

    await this.cacheService.setCache(cacheKey, tenant, 3600)
    return tenant
  }

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    const normalized = subdomain.trim().toLowerCase()
    const cacheKey = `${this.CACHE_PREFIX}subdomain:${normalized}`
    const cached = await this.cacheService.getCache<TenantEntity>(cacheKey)
    const hydratedCached = this.hydrateTenant(cached)
    if (hydratedCached) return hydratedCached

    const tenant = await this.tenantRepository.findBySubdomain(normalized)
    if (tenant) {
      await this.cacheService.setCache(cacheKey, tenant, 3600)
    }
    return tenant
  }

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    const cacheKey = `${this.CACHE_PREFIX}customdomain:${customDomain}`
    const cached = await this.cacheService.getCache<TenantEntity>(cacheKey)
    const hydratedCached = this.hydrateTenant(cached)
    if (hydratedCached) return hydratedCached

    const domainRecord = await this.dataSource.getRepository(TenantDomainEntity).findOne({
      where: { hostname: customDomain },
      relations: [
        'tenant',
        'tenant.domains',
        'tenant.activeSubscription',
        'tenant.activeSubscription.subscriptionPlan',
      ],
    })

    if (domainRecord && domainRecord.status === CustomDomainStatus.ACTIVE) {
      const tenant = domainRecord.tenant
      await this.cacheService.setCache(cacheKey, tenant, 3600)
      return tenant
    }
    return null
  }

  async lookupTenant(subdomain?: string, customDomain?: string): Promise<TenantEntity> {
    let tenant: TenantEntity | null = null

    if (customDomain) {
      tenant = await this.findByCustomDomain(customDomain)
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
    const existing = await this.dataSource.getRepository(TenantDomainEntity).findOne({
      where: { hostname: normalized },
    })
    if (existing && existing.tenantId !== id) {
      throw new ConflictException('Custom domain is already attached to another store')
    }

    const verificationToken = generateVerificationToken()
    const domainRepo = this.dataSource.getRepository(TenantDomainEntity)
    let domainRecord = await domainRepo.findOne({
      where: { tenantId: id, hostname: normalized },
    })

    if (!domainRecord) {
      domainRecord = domainRepo.create({
        tenantId: id,
        hostname: normalized,
        status: CustomDomainStatus.PENDING,
        verificationToken,
        isPrimary: false,
      })
    } else {
      domainRecord.status = CustomDomainStatus.PENDING
      domainRecord.verificationToken = verificationToken
      domainRecord.verifiedAt = null
    }
    await domainRepo.save(domainRecord)

    await this.invalidateTenantCache(id, tenant.subdomain, normalized)

    const instructions: VerificationInstructions = {
      recordType: 'TXT',
      recordHost: `_omnicart-verify.${normalized}`,
      recordValue: verificationToken,
      ttlHint: 300,
    }

    const updatedTenant = await this.findOneTenants(id)
    return Object.assign(updatedTenant, { verificationInstructions: instructions })
  }

  /**
   * Step 2 of the custom-domain flow: we resolve the TXT record at
   * `_omnicart-verify.<domain>` and compare it against the token we issued.
   * Only on an exact match do we flip the status to ACTIVE. Anything else
   * (NXDOMAIN, mismatch, missing token) returns an actionable error and
   * leaves the row PENDING so the user can retry.
   */
  async verifyCustomDomain(tenantId: string, domainId: string): Promise<TenantEntity> {
    const domainRepo = this.dataSource.getRepository(TenantDomainEntity)
    const domainRecord = await domainRepo.findOne({
      where: { id: domainId, tenantId },
    })

    if (!domainRecord) {
      throw new NotFoundException('Domain record not found')
    }
    if (domainRecord.status === CustomDomainStatus.ACTIVE) {
      return this.findOneTenants(tenantId)
    }
    if (!domainRecord.verificationToken) {
      throw new BadRequestException('Verification token missing')
    }

    const result = await verifyDomainOwnership(
      domainRecord.hostname,
      domainRecord.verificationToken,
    )

    if (!result.verified) {
      this.logger.warn(
        `Custom domain TXT verification failed tenant=${tenantId} domain=${domainRecord.hostname} reason=${result.error ?? 'mismatch'}`,
      )
      throw new BadRequestException(
        result.error
          ? `Verification failed: ${result.error}`
          : 'TXT record did not match expected verification token',
      )
    }

    domainRecord.status = CustomDomainStatus.ACTIVE
    domainRecord.verifiedAt = new Date()
    domainRecord.verificationToken = null // Burn the token
    await domainRepo.save(domainRecord)

    const tenant = await this.findOneTenants(tenantId)
    await this.invalidateTenantCache(tenantId, tenant.subdomain, domainRecord.hostname)
    return tenant
  }

  async detachCustomDomain(tenantId: string, domainId: string): Promise<TenantEntity> {
    const domainRepo = this.dataSource.getRepository(TenantDomainEntity)
    const domainRecord = await domainRepo.findOne({
      where: { id: domainId, tenantId },
    })

    if (!domainRecord) {
      throw new NotFoundException('Domain record not found')
    }

    const hostname = domainRecord.hostname
    await domainRepo.remove(domainRecord)

    const tenant = await this.findOneTenants(tenantId)
    await this.invalidateTenantCache(tenantId, tenant.subdomain, hostname)
    return tenant
  }

  async setPrimaryCustomDomain(tenantId: string, domainId: string): Promise<TenantEntity> {
    const domainRepo = this.dataSource.getRepository(TenantDomainEntity)
    const domainRecord = await domainRepo.findOne({
      where: { id: domainId, tenantId },
    })

    if (!domainRecord) {
      throw new NotFoundException('Domain record not found')
    }
    if (domainRecord.status !== CustomDomainStatus.ACTIVE) {
      throw new BadRequestException('Only active domains can be set as primary')
    }

    await this.dataSource.transaction(async (manager) => {
      const txDomainRepo = manager.getRepository(TenantDomainEntity)
      await txDomainRepo.update({ tenantId }, { isPrimary: false })
      await txDomainRepo.update({ id: domainId }, { isPrimary: true })
    })

    const tenant = await this.findOneTenants(tenantId)
    await this.invalidateTenantCache(tenantId, tenant.subdomain, domainRecord.hostname)
    return tenant
  }

  async updateTenantStatus(id: string, status: string): Promise<TenantEntity> {
    const tenant = await this.findOneTenants(id)
    const updated = await this.tenantRepository.updateAndSave(tenant, {
      status: status as TenantStatus,
    })
    await this.invalidateTenantCache(id, tenant.subdomain, tenant.domains?.map((d) => d.hostname))
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
      const subRepo = manager.getRepository(TenantSubscriptionEntity)

      const now = new Date()
      // If current active subscription is still active, extend from endsAt, otherwise from now
      const isCurrentlyActive = tenant.activeSubscription?.endsAt && tenant.activeSubscription.endsAt > now
      const baseDate = isCurrentlyActive ? tenant.activeSubscription.endsAt : now
      const endsAt = new Date(baseDate)

      const billingCycle = tenant.activeSubscription?.billingCycle || SubscriptionBillingCycle.MONTHLY
      if (billingCycle === SubscriptionBillingCycle.YEARLY) {
        endsAt.setFullYear(endsAt.getFullYear() + 1)
      } else {
        endsAt.setMonth(endsAt.getMonth() + 1)
      }

      const sub = subRepo.create({
        tenantId: id,
        subscriptionPlanId: planId,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: billingCycle,
        startsAt: isCurrentlyActive ? tenant.activeSubscription.startsAt : now,
        endsAt,
      })
      const savedSub = await subRepo.save(sub)

      tenant.activeSubscriptionId = savedSub.id
      tenant.activeSubscription = savedSub
      const updatedTenant = await tenantRepo.save(tenant)

      // 2. Clear tenant cache
      await this.invalidateTenantCache(id, tenant.subdomain, tenant.domains?.map((d) => d.hostname))

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
    await this.invalidateTenantCache(tenantId, tenant.subdomain, tenant.domains?.map((d) => d.hostname))

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

  private async invalidateTenantCache(id: string, subdomain?: string, customDomains?: string | string[]) {
    const keys = [`${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}id:${id}`]
    if (subdomain) keys.push(`${this.CACHE_PREFIX}subdomain:${subdomain}`)
    if (customDomains) {
      const domains = Array.isArray(customDomains) ? customDomains : [customDomains]
      for (const d of domains) {
        keys.push(`${this.CACHE_PREFIX}customdomain:${d}`)
      }
    }

    await Promise.all(keys.map((key) => this.cacheService.delCache(key)))
  }
}
