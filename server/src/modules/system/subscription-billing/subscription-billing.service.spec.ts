import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SubscriptionPlanRepository } from '@/modules/system/subscription-plan/subscription-plan.repository'
import { StoreRepository } from '@/modules/system/store/store.repository'
import { ConfigService } from '@nestjs/config'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'
import { SubscriptionBillingService } from './subscription-billing.service'
import { StoreSubscriptionRepository } from './repositories/store-subscription.repository'

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
          provide: StoreSubscriptionRepository,
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
