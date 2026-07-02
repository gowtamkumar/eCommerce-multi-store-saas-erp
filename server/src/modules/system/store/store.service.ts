import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/store/custom-domain-status'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
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
import { InvalidSubdomainError, normalizeSubdomain } from './reserved-subdomains.util'
import { CreateStoreDto } from './dto/create-store.dto'
import { UpdateStoreAiConfigDto } from './dto/store-ai-config.dto'
import { StoreOverviewResponseDto } from './dto/store-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { StoreEntity } from './entities/store.entity'
import { StoreDomainEntity } from './entities/store-domain.entity'
import { StoreSubscriptionEntity } from './entities/store-subscription.entity'
import { StoreFeatureEntity } from './entities/store-feature.entity'
import { StoreRepository } from './store.repository'
import { mergeStoreAiConfigUpdate, toStoreAiConfigResponse } from './utils/store-ai.util'
import { AccountEntity } from '@/modules/admin/operations/finance/accounting/entities/account.entity'
import { getChartOfAccounts } from '@/modules/admin/operations/finance/accounting/constants/default-coa'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { PosRegisterEntity } from '@/modules/admin/sales/pos/entities/pos-register.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import {
  getSymbolForCurrency,
  getCurrencyName,
  getLocaleForCountry,
} from './utils/localization.util'

export interface CreateStoreResponseDto {
  store: StoreEntity
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
export class StoreService {
  private readonly logger = new Logger(StoreService.name)
  private readonly CACHE_PREFIX = 'store:'

  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly userRepository: UserRepository,
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly roleManagementService: RoleManagementService,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
  ) { }

  private hydrateStore(store: StoreEntity | null): StoreEntity | null {
    return store ? Object.assign(new StoreEntity(), store) : null
  }

  private hydrateStores(stores: StoreEntity[]): StoreEntity[] {
    return stores.map((store) => Object.assign(new StoreEntity(), store))
  }

  /**
   * Creates a new store with associated admin user and initial settings.
   * Uses a transaction to ensure atomicity.
   */
  async createStore(createStoreDto: CreateStoreDto): Promise<CreateStoreResponseDto> {
    this.logger.log(`Creating store: ${createStoreDto.storeName}`)

    const {
      storeName,
      subdomain: rawSubdomain,
      planId,
      name,
      username,
      email,
      password,
      subscriptionBillingCycle,
      country,
      baseCurrency,
      timezone,
      accountingStandard,
    } = createStoreDto

    const standard = accountingStandard || 'BAS'

    let subdomain: string
    try {
      subdomain = normalizeSubdomain(rawSubdomain)
    } catch (err: any) {
      if (err instanceof InvalidSubdomainError) {
        throw new BadRequestException(err.message)
      }
      throw err
    }

    // 1. Check if subdomain already exists
    const existingStore = await this.storeRepository.findBySubdomain(subdomain)
    if (existingStore) {
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
        'No subscription plan is available. Please configure at least one active plan before onboarding stores.',
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
      const storeRepo = manager.withRepository(this.storeRepository['repo'])
      const userRepo = manager.getRepository(this.userRepository['repo'].target)

      // Create store
      const store = storeRepo.create({
        storeName,
        subdomain,
        accountingStandard: standard,
      })
      const savedStore = await storeRepo.save(store)

      // Create initial trial subscription
      const subRepo = manager.getRepository(StoreSubscriptionEntity)
      const sub = subRepo.create({
        storeId: savedStore.id,
        subscriptionPlanId: subscriptionPlan.id,
        status: SubscriptionStatus.TRIAL,
        billingCycle: billingCycle,
        startsAt: now,
        endsAt: trialEndsAt,
      })
      const savedSub = await subRepo.save(sub)

      // Associate with store
      savedStore.activeSubscriptionId = savedSub.id
      savedStore.activeSubscription = savedSub
      await storeRepo.save(savedStore)

      // Create default Main Branch
      const branchRepo = manager.getRepository(BranchEntity)
      const defaultBranch = branchRepo.create({
        name: 'Main Branch',
        code: `MAIN-${subdomain.toUpperCase()}`,
        storeId: savedStore.id,
        isActive: true,
      })
      const savedBranch = await branchRepo.save(defaultBranch)

      // Create default Warehouse
      const warehouseRepo = manager.getRepository(WarehouseEntity)
      const defaultWarehouse = warehouseRepo.create({
        name: 'Main Warehouse',
        code: `WH-${subdomain.toUpperCase()}`,
        storeId: savedStore.id,
        branchId: savedBranch.id,
        isActive: true,
      })
      await warehouseRepo.save(defaultWarehouse)

      // Create default POS Register / Cash Drawer
      const posRegisterRepo = manager.getRepository(PosRegisterEntity)
      const defaultRegister = posRegisterRepo.create({
        name: 'Main Till',
        branchId: savedBranch.id,
        storeId: savedStore.id,
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
        storeId: savedStore.id,
        branch: savedBranch,
        isAdmin: false,
        emailVerificationToken: verificationToken,
      })
      const savedUser = await userRepo.save(user)

      // Link user to store
      savedStore.userId = savedUser.id
      await storeRepo.save(savedStore)

      // Seed default roles and assign Super Admin to the new user
      const superAdminRole = await this.roleManagementService.seedSuperAdminRole(
        savedStore.id,
        manager,
      )
      await this.roleManagementService.seedDefaultRoles(savedStore.id, manager)

      const assignmentRepo = manager.getRepository(UserRoleAssignmentEntity)
      await assignmentRepo.save(
        assignmentRepo.create({
          userId: savedUser.id,
          roleId: superAdminRole.id,
          storeId: savedStore.id,
          scopeType: RoleScopeType.GLOBAL,
          assignedBy: savedUser.id,
        }),
      )

      // Store features are resolved dynamically from the Subscription Plan.

      // Initialize compliance-specific Chart of Accounts (COA) for this new store
      const accountRepo = manager.getRepository(AccountEntity)
      const seedCoa = getChartOfAccounts(standard)
      const accounts = seedCoa.map((coa) =>
        accountRepo.create({
          ...coa,
          storeId: savedStore.id,
          userId: savedUser.id,
        }),
      )
      await accountRepo.save(accounts)

      // Initialize Site Settings inside the transaction to guarantee onboarding atomicity
      await this.settingsService.createSetting(
        { storeId: savedStore.id } as RequestContextDto,
        {
          userId: savedUser.id,
          brandName: storeName,
          siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
          contactEmail: email,
          currency: baseCurrency,
          currencySymbol: getSymbolForCurrency(baseCurrency),
          supportedCurrencies: [
            {
              code: baseCurrency,
              symbol: getSymbolForCurrency(baseCurrency),
              rate: 1,
              name: getCurrencyName(baseCurrency),
            },
          ],
          timezone: timezone,
          locale: getLocaleForCountry(country),
        },
        manager,
      )

      return {
        store: savedStore,
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
      // Send verification email (fire and forget or handle errors gracefully)
      this.mailService
        .sendVerificationEmail(email, result.verificationToken, result.store.id)
        .catch((err) => this.logger.error(`Failed to send verification email for ${email}:`, err)),
      // Trigger Global Super Admin Notification
      this.notificationService
        .createNotification(
          {
            title: 'New Store Signup',
            message: `A new store '${storeName}' (${subdomain}) has registered on the platform.`,
            type: 'INFO',
            link: `/system/stores/${result.store.id}`,
            userId: null as any,
          },
          null,
        )
        .catch((err) =>
          this.logger.error(`Failed to trigger super admin store notification:`, err),
        ),
    ])

    return {
      store: result.store,
      admin: result.admin,
    }
  }

  async findAllStores(): Promise<StoreEntity[]> {
    const cacheKey = `${this.CACHE_PREFIX}all`
    const cached = await this.cacheService.getCache<StoreEntity[]>(cacheKey)
    if (cached) return this.hydrateStores(cached)

    const stores = await this.storeRepository.findAllSorted()
    await this.cacheService.setCache(cacheKey, stores, 3600) // Cache for 1 hour
    return stores
  }

  async findOneStores(id: string): Promise<StoreEntity> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`
    const cached = await this.cacheService.getCache<StoreEntity>(cacheKey)
    const hydratedCached = this.hydrateStore(cached)
    if (hydratedCached) return hydratedCached

    const store = await this.storeRepository.findByIdWithRelations(id)
    if (!store) {
      throw new NotFoundException(`Store with ID "${id}" not found`)
    }

    await this.cacheService.setCache(cacheKey, store, 3600)
    return store
  }

  async findBySubdomain(subdomain: string): Promise<StoreEntity | null> {
    const normalized = subdomain.trim().toLowerCase()
    const cacheKey = `${this.CACHE_PREFIX}subdomain:${normalized}`
    const cached = await this.cacheService.getCache<StoreEntity>(cacheKey)
    const hydratedCached = this.hydrateStore(cached)
    if (hydratedCached) return hydratedCached

    const store = await this.storeRepository.findBySubdomain(normalized)
    if (store) {
      await this.cacheService.setCache(cacheKey, store, 3600)
    }
    return store
  }

  async findByCustomDomain(customDomain: string): Promise<StoreEntity | null> {
    const cacheKey = `${this.CACHE_PREFIX}customdomain:${customDomain}`
    const cached = await this.cacheService.getCache<any>(cacheKey)
    if (cached) {
      if (cached.id === '__NOT_FOUND__') {
        return null
      }
      const hydratedCached = this.hydrateStore(cached)
      if (hydratedCached) return hydratedCached
    }

    const domainRecord = await this.dataSource.getRepository(StoreDomainEntity).findOne({
      where: { hostname: customDomain },
      relations: {
        store: {
          domains: true,
          activeSubscription: {
            subscriptionPlan: true,
          },
        },
      },
    })

    if (domainRecord && domainRecord.status === CustomDomainStatus.ACTIVE) {
      const store = domainRecord.store
      await this.cacheService.setCache(cacheKey, store, 3600)
      return store
    }

    // Cache negative lookup (e.g. invalid domains) for 3 minutes (180 seconds) to prevent DoS on database
    await this.cacheService.setCache(cacheKey, { id: '__NOT_FOUND__' }, 180)
    return null
  }

  async lookupStore(subdomain?: string, customDomain?: string): Promise<StoreEntity> {
    let store: StoreEntity | null = null

    if (customDomain) {
      store = await this.findByCustomDomain(customDomain)
    }

    // Fallback to subdomain check if custom domain is not found or not provided
    if (!store && subdomain) {
      store = await this.findBySubdomain(subdomain)
    }

    if (!store) {
      throw new NotFoundException('Store not found. Please check the domain or subdomain.')
    }
    return store
  }

  /**
   * Step 1 of the custom-domain flow: the store tells us which hostname they
   * intend to point at us. We:
   *   - normalise the hostname
   *   - ensure no other store already claims it
   *   - reset status to PENDING
   *   - issue a fresh verification token
   * The frontend then displays the TXT record we expect at
   * `_omnicart-verify.<domain>` and the store proves ownership via DNS.
   */
  async requestCustomDomain(
    id: string,
    customDomainInput: string,
  ): Promise<StoreEntity & { verificationInstructions: VerificationInstructions }> {
    let normalized: string
    try {
      normalized = normalizeCustomDomain(customDomainInput)
    } catch (err: any) {
      if (err instanceof InvalidCustomDomainError) {
        throw new BadRequestException(err.message)
      }
      throw err
    }

    const store = await this.findOneStores(id)

    // Block claims of a domain owned by someone else.
    const existing = await this.dataSource.getRepository(StoreDomainEntity).findOne({
      where: { hostname: normalized },
    })
    if (existing && existing.storeId !== id) {
      throw new ConflictException('Custom domain is already attached to another store')
    }

    const verificationToken = generateVerificationToken()
    const domainRepo = this.dataSource.getRepository(StoreDomainEntity)
    let domainRecord = await domainRepo.findOne({
      where: { storeId: id, hostname: normalized },
    })

    if (!domainRecord) {
      domainRecord = domainRepo.create({
        storeId: id,
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

    await this.invalidateStoreCache(id, store.subdomain, normalized)

    const instructions: VerificationInstructions = {
      recordType: 'TXT',
      recordHost: `_omnicart-verify.${normalized}`,
      recordValue: verificationToken,
      ttlHint: 300,
    }

    const updatedStore = await this.findOneStores(id)
    return Object.assign(updatedStore, { verificationInstructions: instructions })
  }

  /**
   * Step 2 of the custom-domain flow: we resolve the TXT record at
   * `_omnicart-verify.<domain>` and compare it against the token we issued.
   * Only on an exact match do we flip the status to ACTIVE. Anything else
   * (NXDOMAIN, mismatch, missing token) returns an actionable error and
   * leaves the row PENDING so the user can retry.
   */
  async verifyCustomDomain(storeId: string, domainId: string): Promise<StoreEntity> {
    const domainRepo = this.dataSource.getRepository(StoreDomainEntity)
    const domainRecord = await domainRepo.findOne({
      where: { id: domainId, storeId },
    })

    if (!domainRecord) {
      throw new NotFoundException('Domain record not found')
    }
    if (domainRecord.status === CustomDomainStatus.ACTIVE) {
      return this.findOneStores(storeId)
    }
    if (!domainRecord.verificationToken) {
      throw new BadRequestException('Verification token missing')
    }

    // Reset FAILED → PENDING so the user can retry cleanly
    if (domainRecord.status === CustomDomainStatus.FAILED) {
      domainRecord.status = CustomDomainStatus.PENDING
      await domainRepo.save(domainRecord)
    }

    const result = await verifyDomainOwnership(
      domainRecord.hostname,
      domainRecord.verificationToken,
    )

    if (!result.verified) {
      this.logger.warn(
        `Custom domain TXT verification failed store=${storeId} domain=${domainRecord.hostname} reason=${result.error ?? 'mismatch'}`,
      )
      // Persist FAILED status so the UI can surface a clear error state.
      // The verificationToken is preserved so the user can retry after
      // correcting their DNS records.
      domainRecord.status = CustomDomainStatus.FAILED
      await domainRepo.save(domainRecord)
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

    const store = await this.findOneStores(storeId)
    await this.invalidateStoreCache(storeId, store.subdomain, domainRecord.hostname)
    return store
  }

  async detachCustomDomain(storeId: string, domainId: string): Promise<StoreEntity> {
    const domainRepo = this.dataSource.getRepository(StoreDomainEntity)
    const domainRecord = await domainRepo.findOne({
      where: { id: domainId, storeId },
    })

    if (!domainRecord) {
      throw new NotFoundException('Domain record not found')
    }

    const hostname = domainRecord.hostname
    await domainRepo.remove(domainRecord)

    const store = await this.findOneStores(storeId)
    await this.invalidateStoreCache(storeId, store.subdomain, hostname)
    return store
  }

  async setPrimaryCustomDomain(storeId: string, domainId: string): Promise<StoreEntity> {
    const domainRepo = this.dataSource.getRepository(StoreDomainEntity)
    const domainRecord = await domainRepo.findOne({
      where: { id: domainId, storeId },
    })

    if (!domainRecord) {
      throw new NotFoundException('Domain record not found')
    }
    if (domainRecord.status !== CustomDomainStatus.ACTIVE) {
      throw new BadRequestException('Only active domains can be set as primary')
    }

    await this.dataSource.transaction(async (manager) => {
      const txDomainRepo = manager.getRepository(StoreDomainEntity)
      await txDomainRepo.update({ storeId }, { isPrimary: false })
      await txDomainRepo.update({ id: domainId }, { isPrimary: true })
    })

    const store = await this.findOneStores(storeId)
    await this.invalidateStoreCache(storeId, store.subdomain, domainRecord.hostname)
    return store
  }

  async updateStoreStatus(id: string, status: string): Promise<StoreEntity> {
    const store = await this.findOneStores(id)
    const updated = await this.storeRepository.updateAndSave(store, {
      status: status as StoreStatus,
    })
    await this.invalidateStoreCache(
      id,
      store.subdomain,
      store.domains?.map((d) => d.hostname),
    )
    return updated
  }

  async storeOverview(): Promise<StoreOverviewResponseDto> {
    const stats = await this.storeRepository.getStoreStats()
    return {
      totalStores: stats.total,
      activeStores: stats.active,
      suspendedStores: stats.suspended,
      archivedStores: stats.archived,
    }
  }

  /**
   * Efficiently gather analytics for all stores using bulk aggregation queries.
   * Fixes the N+1 query problem in SuperAdmin analytics.
   */
  async getBulkStoreAnalytics(): Promise<any[]> {
    const stores = await this.findAllStores()

    // Fetch counts for all stores in parallel using optimized group-by queries
    const [userCounts, productCounts, orderCounts, pageCounts] = await Promise.all([
      this.getCountsGroupedByStore('users'),
      this.getCountsGroupedByStore('products'),
      this.getCountsGroupedByStore('orders'),
      this.getCountsGroupedByStore('pages'),
    ])

    return stores.map((store) => ({
      id: store.id,
      storeName: store.storeName,
      subdomain: store.subdomain,
      subscriptionPlan: store.subscriptionPlan,
      status: store.status,
      stats: {
        users: userCounts[store.id] || 0,
        products: productCounts[store.id] || 0,
        orders: orderCounts[store.id] || 0,
        pages: pageCounts[store.id] || 0,
        traffic: 0, // Traffic stats could be added here if needed
      },
    }))
  }

  /**
   * Get detailed analytics for a single store efficiently.
   */
  async getDetailedAnalytics(id: string): Promise<any> {
    const store = await this.findOneStores(id)
    const [users, products, orders, pages] = await Promise.all([
      this.userRepository.countByStore(id),
      this.dataSource.query('SELECT COUNT(*) FROM products WHERE store_id = $1', [id]),
      this.dataSource.query('SELECT COUNT(*) FROM orders WHERE store_id = $1', [id]),
      this.dataSource.query('SELECT COUNT(*) FROM pages WHERE store_id = $1', [id]),
    ])

    return {
      storeInfo: {
        id: store.id,
        storeName: store.storeName,
        subdomain: store.subdomain,
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

  private async getCountsGroupedByStore(tableName: string): Promise<Record<string, number>> {
    const results = await this.dataSource.query(
      `SELECT store_id, COUNT(*) as count FROM ${tableName} WHERE store_id IS NOT NULL GROUP BY store_id`,
    )
    return results.reduce((acc, row) => {
      acc[row.store_id] = parseInt(row.count, 10)
      return acc
    }, {})
  }

  async updateStorePlan(id: string, planId: string): Promise<StoreEntity> {
    this.logger.log(`Updating store plan for store ID: ${id} to plan ID: ${planId}`)

    const store = await this.findOneStores(id)
    const newPlan = await this.subscriptionPlanService.findOneSubscriptionPlan(planId)
    if (!newPlan) {
      throw new NotFoundException(`Subscription plan with ID "${planId}" not found`)
    }

    return await this.dataSource.transaction(async (manager) => {
      const storeRepo = manager.getRepository(StoreEntity)
      const subRepo = manager.getRepository(StoreSubscriptionEntity)

      const now = new Date()
      // If current active subscription is still active, extend from endsAt, otherwise from now
      const isCurrentlyActive =
        store.activeSubscription?.endsAt && store.activeSubscription.endsAt > now
      const baseDate = isCurrentlyActive ? store.activeSubscription.endsAt : now
      const endsAt = new Date(baseDate)

      const billingCycle =
        store.activeSubscription?.billingCycle || SubscriptionBillingCycle.MONTHLY
      if (billingCycle === SubscriptionBillingCycle.YEARLY) {
        endsAt.setFullYear(endsAt.getFullYear() + 1)
      } else {
        endsAt.setMonth(endsAt.getMonth() + 1)
      }

      const sub = subRepo.create({
        storeId: id,
        subscriptionPlanId: planId,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: billingCycle,
        startsAt: isCurrentlyActive ? store.activeSubscription.startsAt : now,
        endsAt,
      })
      const savedSub = await subRepo.save(sub)

      store.activeSubscriptionId = savedSub.id
      store.activeSubscription = savedSub
      const updatedStore = await storeRepo.save(store)

      // 2. Clear store cache
      await this.invalidateStoreCache(
        id,
        store.subdomain,
        store.domains?.map((d) => d.hostname),
      )

      // 3. Invalidate permission manifest caches for all store users
      try {
        const members = await this.userRepository.findTeamMembers(id)
        for (const member of members) {
          const cacheKey = `rbac:manifest:${id}:${member.id}`
          await this.cacheService.delCache(cacheKey)
        }
      } catch (err: any) {
        this.logger.error(`Failed to invalidate team member permission caches: ${err.message}`)
      }

      return updatedStore
    })
  }

  isSubscriptionExpired(store: StoreEntity): boolean {
    return store.isExpired
  }

  async getStoreFeatures(storeId: string) {
    const store = await this.findOneStores(storeId)
    if (!store) throw new NotFoundException('Store not found')

    // 1. Get all unique features across all subscription plans
    const plans = await this.subscriptionPlanService.findAllSubscriptionPlans()
    const allFeaturesSet = new Set<string>()
    for (const p of plans) {
      for (const f of p.features || []) {
        allFeaturesSet.add(f)
      }
    }

    // 2. Get active plan features for this store
    const planFeatures = new Set<string>(store.subscriptionPlan?.features || [])

    // 3. Get existing overrides in DB
    const overrides = await this.dataSource.getRepository(StoreFeatureEntity).find({
      where: { storeId },
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

  async updateStoreFeatureOverride(
    storeId: string,
    featureSlug: string,
    overrideValue: boolean | null,
  ) {
    const store = await this.findOneStores(storeId)
    if (!store) throw new NotFoundException('Store not found')

    const featureRepo = this.dataSource.getRepository(StoreFeatureEntity)

    if (overrideValue === null) {
      // Reset: delete override record
      await featureRepo.delete({ storeId, featureSlug })
    } else {
      // Upsert override record
      let override = await featureRepo.findOne({ where: { storeId, featureSlug } })
      if (override) {
        override.isEnabled = overrideValue
        override.updatedAt = new Date()
        await featureRepo.save(override)
      } else {
        override = featureRepo.create({
          storeId,
          featureSlug,
          isEnabled: overrideValue,
          enabledAt: overrideValue ? new Date() : null,
        })
        await featureRepo.save(override)
      }
    }

    // Clear store cache
    await this.invalidateStoreCache(
      storeId,
      store.subdomain,
      store.domains?.map((d) => d.hostname),
    )

    // Invalidate permission manifest caches for all store users
    try {
      const members = await this.userRepository.findTeamMembers(storeId)
      for (const member of members) {
        const cacheKey = `rbac:manifest:${storeId}:${member.id}`
        await this.cacheService.delCache(cacheKey)
      }
    } catch (err: any) {
      this.logger.error(`Failed to invalidate team member permission caches: ${err.message}`)
    }

    return { success: true }
  }

  async getStoreAiConfig(storeId: string) {
    const store = await this.findOneStores(storeId)
    return toStoreAiConfigResponse(store.aiConfig || null)
  }

  async updateStoreAiConfig(storeId: string, dto: UpdateStoreAiConfigDto) {
    const store = await this.findOneStores(storeId)
    const merged = mergeStoreAiConfigUpdate(store.aiConfig || null, dto)
    const updated = await this.storeRepository.updateAndSave(store, {
      aiConfig: merged,
    })
    await this.invalidateStoreCache(
      storeId,
      store.subdomain,
      store.domains?.map((d) => d.hostname),
    )
    return toStoreAiConfigResponse(updated.aiConfig || null)
  }

  private async invalidateStoreCache(
    id: string,
    subdomain?: string,
    customDomains?: string | string[],
  ) {
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
