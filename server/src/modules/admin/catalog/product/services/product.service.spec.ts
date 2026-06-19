import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { BrandRepository } from '../../brand/brand.repository'
import { ProductAttributeRepository } from '../repositories/attribute.repository'
import { ProductRepository } from '../repositories/product.repository'
import { ProductVariantRepository } from '../repositories/variant.repository'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'
import { SuperAdminCrossTenantRepository } from '@/modules/system/super-admin/repositories/super-admin-cross-tenant.repository'
import { ProductService } from './product.service'

describe('ProductService', () => {
  let service: ProductService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {},
        },
        {
          provide: FaqRepository,
          useValue: {},
        },
        {
          provide: ProductAttributeRepository,
          useValue: {},
        },
        {
          provide: ProductVariantRepository,
          useValue: {},
        },
        {
          provide: BrandRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: InventoryLedgerService,
          useValue: {},
        },
        {
          provide: PromotionService,
          useValue: {},
        },
        {
          provide: TenantService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: AddonCatalogService,
          useValue: {},
        },
        {
          provide: getQueueToken('product'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: SuperAdminCrossTenantRepository,
          useValue: {},
        },
        {
          provide: require('./product-embedding.service').ProductEmbeddingService,
          useValue: {
            canUseHybridSearch: jest.fn().mockResolvedValue(false),
            recordSearchEvent: jest.fn(),
          },
        },
        {
          provide: require('../../../ai/services/ai-job.service').AiJobService,
          useValue: {},
        },
        {
          provide: require('../../category/category.repository').CategoryRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ProductService>(ProductService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
