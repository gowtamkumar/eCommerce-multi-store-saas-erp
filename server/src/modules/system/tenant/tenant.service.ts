import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { SubscriptionPlanService } from '@/modules/system/subscription-plan/subscription-plan.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { DataSource } from 'typeorm'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantOverviewResponseDto } from './dto/tenant-response.dto'
import { TenantEntity } from './entities/tenant.entity'
import { TenantRepository } from './tenant.repository'

export interface CreateTenantResponseDto {
  tenant: TenantEntity
  admin: {
    id: string
    name: string
    username: string
    email: string
  }
}

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
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) { }

  /**
   * Creates a new tenant with associated admin user and initial settings.
   * Uses a transaction to ensure atomicity.
   */
  async createTenant(createTenantDto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    this.logger.log(`Creating tenant: ${createTenantDto.storeName}`)

    const { storeName, subdomain, planId, name, username, email, password, subscriptionBillingCycle } = createTenantDto

    // 1. Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findBySubdomain(subdomain)
    if (existingTenant) {
      throw new ConflictException(`Subdomain "${subdomain}" is already taken`)
    }

    // 2. Prepare subscription details
    const now = new Date()
    const trialEndsAt = new Date()
    trialEndsAt.setDate(now.getDate() + 14)

    let subscriptionPlan = null
    let billingCycle = subscriptionBillingCycle || SubscriptionBillingCycle.MONTHLY

    if (planId) {
      subscriptionPlan = await this.subscriptionPlanService.findOneSubscriptionPlan(planId)
      if (subscriptionPlan && !subscriptionBillingCycle) {
        billingCycle = subscriptionPlan.billingCycle
      }
    }

    // 3. Execute creation in a transaction
    return await this.dataSource.transaction(async (manager) => {
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

      // Create admin user
      const hashedPassword = await bcrypt.hash(password, 10)
      const verificationToken = crypto.randomBytes(32).toString('hex')

      const user = userRepo.create({
        name,
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        tenantId: savedTenant.id,
        isAdmin: false,
        emailVerificationToken: verificationToken,
      })
      const savedUser = await userRepo.save(user)

      // Link user to tenant
      savedTenant.userId = savedUser.id
      await tenantRepo.save(savedTenant)

      // 4. Parallelize non-critical initialization tasks
      await Promise.all([
        // Initialize Site Settings
        this.settingsService.createSetting(savedTenant.id, {
          userId: savedUser.id,
          brandName: storeName,
          siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
          contactEmail: email,
        }),
        // Send verification email (fire and forget or handle errors gracefully)
        this.mailService.sendVerificationEmail(
          email,
          verificationToken,
          savedTenant.id,
        ).catch(err => this.logger.error(`Failed to send verification email for ${email}:`, err)),
      ])

      return {
        tenant: savedTenant,
        admin: {
          id: savedUser.id,
          name: savedUser.name,
          username: savedUser.username,
          email: savedUser.email,
        },
      }
    })
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

    const tenant = await this.tenantRepository.findById(id)
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
    if (tenant) {
      await this.cacheService.setCache(cacheKey, tenant, 3600)
    }
    return tenant
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

  async updateCustomDomain(id: string, customDomain: string): Promise<TenantEntity> {
    const tenant = await this.findOneTenants(id)
    const updated = await this.tenantRepository.updateAndSave(tenant, {
      customDomain,
      customDomainStatus: CustomDomainStatus.PENDING,
      customDomainVerifiedAt: null,
    })
    await this.invalidateTenantCache(id, tenant.subdomain, customDomain)
    return updated
  }

  async verifyCustomDomain(id: string): Promise<TenantEntity> {
    const tenant = await this.findOneTenants(id)
    const updated = await this.tenantRepository.updateAndSave(tenant, {
      customDomainStatus: CustomDomainStatus.ACTIVE,
      customDomainVerifiedAt: new Date(),
    })
    await this.invalidateTenantCache(id, tenant.subdomain, tenant.customDomain)
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

  isSubscriptionExpired(tenant: TenantEntity): boolean {
    return tenant.isExpired
  }

  private async invalidateTenantCache(id: string, subdomain?: string, customDomain?: string) {
    const keys = [`${this.CACHE_PREFIX}all`, `${this.CACHE_PREFIX}id:${id}`]
    if (subdomain) keys.push(`${this.CACHE_PREFIX}subdomain:${subdomain}`)
    if (customDomain) keys.push(`${this.CACHE_PREFIX}customdomain:${customDomain}`)

    await Promise.all(keys.map(key => this.cacheService.delCache(key)))
  }
}
