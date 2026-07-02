import { Test, TestingModule } from '@nestjs/testing'
import { StoreService } from './store.service'
import { StoreRepository } from './store.repository'
import { getRepositoryToken } from '@nestjs/typeorm'
import { StoreFeatureEntity } from './entities/store-feature.entity'
import { StoreSubscriptionEntity } from './entities/store-subscription.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { SubscriptionPlanService } from '@/modules/system/subscription-plan/subscription-plan.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'
import { DataSource } from 'typeorm'
import { StoreEntity } from './entities/store.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { NotFoundException } from '@nestjs/common'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

describe('StoreService', () => {
  let service: StoreService
  let storeRepository: any
  let subscriptionPlanService: any
  let cacheService: any
  let userRepository: any
  let roleManagementService: any
  let settingsService: any
  let mailService: any
  let dataSource: any

  const mockRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((dto) => {
      if (Array.isArray(dto)) {
        return Promise.resolve(dto.map(item => Object.assign(item, { id: 'mock-id' })))
      }
      return Promise.resolve(Object.assign(dto, { id: 'mock-id' }))
    }),
  }

  const mockManager = {
    withRepository: jest.fn().mockImplementation((repo) => repo),
    getRepository: jest.fn().mockReturnValue(mockRepo),
  }

  beforeEach(async () => {
    storeRepository = {
      findOneStores: jest.fn(),
      findBySubdomain: jest.fn().mockResolvedValue(null),
      repo: mockRepo,
    }
    subscriptionPlanService = {
      findOneSubscriptionPlan: jest.fn().mockResolvedValue({ id: 'plan-1', trialPeriodDays: 14 }),
      findActiveSubscriptionPlans: jest.fn().mockResolvedValue([{ id: 'plan-1', trialPeriodDays: 14 }]),
    }
    cacheService = {
      getCache: jest.fn(),
      delCache: jest.fn(),
      setCache: jest.fn(),
    }
    userRepository = {
      repo: {
        target: 'UserEntity',
      },
      findTeamMembers: jest.fn().mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]),
    }
    roleManagementService = {
      seedSuperAdminRole: jest.fn().mockResolvedValue({ id: 'role-1' }),
      seedDefaultRoles: jest.fn().mockResolvedValue(true),
    }
    settingsService = {
      createSetting: jest.fn().mockResolvedValue(true),
    }
    mailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
    }
    dataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: StoreRepository, useValue: storeRepository },
        { provide: getRepositoryToken(StoreFeatureEntity), useValue: {} },
        { provide: getRepositoryToken(UserRoleAssignmentEntity), useValue: {} },
        { provide: UserRepository, useValue: userRepository },
        { provide: SubscriptionPlanService, useValue: subscriptionPlanService },
        { provide: CacheService, useValue: cacheService },
        { provide: MailService, useValue: mailService },
        { provide: SettingsService, useValue: settingsService },
        { provide: RoleManagementService, useValue: roleManagementService },
        { provide: DataSource, useValue: dataSource },
        {
          provide: NotificationService,
          useValue: { createNotification: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile()

    service = module.get<StoreService>(StoreService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateStorePlan', () => {
    it('should throw NotFoundException if new plan is not found', async () => {
      const mockStore = new StoreEntity()
      mockStore.id = 'store-1'
      mockStore.subdomain = 'sub'
      mockStore.domains = []
      jest.spyOn(service, 'findOneStores').mockResolvedValue(mockStore)
      subscriptionPlanService.findOneSubscriptionPlan.mockResolvedValue(null)

      await expect(service.updateStorePlan('store-1', 'plan-2')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should update plan, sync features, and invalidate caches inside transaction', async () => {
      const mockStore = new StoreEntity()
      mockStore.id = 'store-1'
      mockStore.subdomain = 'sub'
      mockStore.domains = []
      const mockPlan = {
        id: 'plan-2',
        name: 'Pro Seller',
        features: ['/admin', '/admin/pos'],
      } as SubscriptionPlanEntity

      jest.spyOn(service, 'findOneStores').mockResolvedValue(mockStore)
      subscriptionPlanService.findOneSubscriptionPlan.mockResolvedValue(mockPlan)

      const result = await service.updateStorePlan('store-1', 'plan-2')

      expect(result.subscriptionPlanId).toBe('plan-2')
      expect(dataSource.transaction).toHaveBeenCalled()
      expect(cacheService.delCache).toHaveBeenCalledWith('store:id:store-1')
      expect(cacheService.delCache).toHaveBeenCalledWith('rbac:manifest:store-1:user-1')
      expect(cacheService.delCache).toHaveBeenCalledWith('rbac:manifest:store-1:user-2')
    })
  })

  describe('findByCustomDomain', () => {
    it('should return cached store if present in cache', async () => {
      const mockStore = { id: 'store-1', storeName: 'Test Store' } as any
      cacheService.getCache.mockResolvedValue(mockStore)

      const result = await service.findByCustomDomain('test.com')

      expect(cacheService.getCache).toHaveBeenCalledWith('store:customdomain:test.com')
      expect(result).toBeDefined()
      expect(result?.storeName).toBe('Test Store')
    })

    it('should return null immediately if cache contains __NOT_FOUND__ sentinel', async () => {
      cacheService.getCache.mockResolvedValue({ id: '__NOT_FOUND__' })

      const result = await service.findByCustomDomain('invalid.com')

      expect(result).toBeNull()
      expect(dataSource.getRepository).not.toHaveBeenCalled()
    })

    it('should query DB and cache store if active domain is found', async () => {
      cacheService.getCache.mockResolvedValue(null)
      const mockDomainRecord = {
        status: 'active',
        store: { id: 'store-1', storeName: 'Test Store' },
      }
      const findOneMock = jest.fn().mockResolvedValue(mockDomainRecord)
      dataSource.getRepository = jest.fn().mockReturnValue({ findOne: findOneMock })
      cacheService.setCache = jest.fn()

      const result = await service.findByCustomDomain('test.com')

      expect(findOneMock).toHaveBeenCalledWith({
        where: { hostname: 'test.com' },
        relations: {
          store: {
            domains: true,
            activeSubscription: {
              subscriptionPlan: true,
            },
          },
        },
      })
      expect(cacheService.setCache).toHaveBeenCalledWith(
        'store:customdomain:test.com',
        mockDomainRecord.store,
        3600,
      )
      expect(result?.storeName).toBe('Test Store')
    })

    it('should cache negative lookup for 3 minutes if domain is not found', async () => {
      cacheService.getCache.mockResolvedValue(null)
      const findOneMock = jest.fn().mockResolvedValue(null)
      dataSource.getRepository = jest.fn().mockReturnValue({ findOne: findOneMock })
      cacheService.setCache = jest.fn()

      const result = await service.findByCustomDomain('nonexistent.com')

      expect(result).toBeNull()
      expect(cacheService.setCache).toHaveBeenCalledWith(
        'store:customdomain:nonexistent.com',
        { id: '__NOT_FOUND__' },
        180,
      )
    })
  })

  describe('createStore', () => {
    it('should create a store, route database residency and seed dynamic Chart of Accounts (COA)', async () => {
      const dto = {
        storeName: 'Acme Store',
        subdomain: 'acme',
        name: 'Acme Admin',
        username: 'acmeadmin',
        email: 'acme@acme.com',
        password: 'Password123!',
        country: 'US',
        baseCurrency: 'USD',
        timezone: 'America/New_York',
        accountingStandard: 'US-GAAP',
        residencyRegion: 'US',
      }

      mockRepo.create.mockClear()

      const result = await service.createStore(dto)

      expect(result.store).toBeDefined()
      // Verify database residency routing fields
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          storeName: 'Acme Store',
          subdomain: 'acme',
          accountingStandard: 'US-GAAP',
          residencyRegion: 'US',
          dbHost: 'us-db.gowtam.com',
          dbName: 'store_acme_us',
        }),
      )

      // Verify dynamic COA seeding
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '1000',
          name: 'Cash & Cash Equivalents',
        }),
      )
    })

    it('should fall back to BAS and AS defaults if standard and region are not provided', async () => {
      const dto = {
        storeName: 'Fallback Store',
        subdomain: 'fallback',
        name: 'Fallback Admin',
        username: 'fallbackadmin',
        email: 'fallback@fallback.com',
        password: 'Password123!',
        country: 'BD',
        baseCurrency: 'BDT',
        timezone: 'Asia/Dhaka',
      }

      mockRepo.create.mockClear()

      const result = await service.createStore(dto)

      expect(result.store).toBeDefined()
      // Verify default fallback database residency fields
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          storeName: 'Fallback Store',
          subdomain: 'fallback',
          accountingStandard: 'BAS',
          residencyRegion: 'AS',
          dbHost: 'postgres',
          dbName: 'multi_store_ecommerce',
        }),
      )

      // Verify dynamic COA seeding falls back to BAS_COA
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '1000',
          name: 'Cash',
        }),
      )
    })
  })
})
