import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SubscriptionPlanRepository } from '@/modules/system/subscription-plan/subscription-plan.repository'
import { StoreRepository } from '@/modules/system/store/store.repository'
import { StoreSubscriptionEntity } from '@/modules/system/store/entities/store-subscription.entity'
import { ConfigService } from '@nestjs/config'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'
import { SubscriptionBillingService } from './subscription-billing.service'

describe('SubscriptionBillingService', () => {
  let service: SubscriptionBillingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionBillingService,
        {
          provide: SubscriptionInvoiceRepository,
          useValue: {},
        },
        {
          provide: StoreRepository,
          useValue: {},
        },
        {
          provide: SubscriptionPlanRepository,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              if (defaultValue !== undefined) return defaultValue;
              if (key.includes('PORT')) return 587;
              if (key.includes('SECURE')) return false;
              return '';
            }),
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: AddonCatalogService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(StoreSubscriptionEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
            })),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<SubscriptionBillingService>(SubscriptionBillingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
