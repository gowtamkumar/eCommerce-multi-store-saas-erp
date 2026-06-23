import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PriceBookEntity } from './entities/price-book.entity'
import { ProductPriceEntity } from './entities/product-price.entity'
import { PricingService } from './pricing.service'
import { PriceBookType } from './enums/price-book-type.enum'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'

describe('PricingService', () => {
  let service: PricingService
  let priceBookRepo: any
  let productPriceRepo: any
  let siteSettingsRepo: any

  beforeEach(async () => {
    siteSettingsRepo = {
      findOne: jest.fn().mockResolvedValue({
        currency: 'BDT',
        supportedCurrencies: [
          { code: 'BDT', rate: 1.0 },
          { code: 'USD', rate: 120.0 },
        ],
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(PriceBookEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            manager: {
              getRepository: jest.fn().mockReturnValue(siteSettingsRepo),
            },
          },
        },
        {
          provide: getRepositoryToken(ProductPriceEntity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<PricingService>(PricingService)
    priceBookRepo = module.get(getRepositoryToken(PriceBookEntity))
    productPriceRepo = module.get(getRepositoryToken(ProductPriceEntity))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Currency-specific Price Book Resolution', () => {
    it('should resolve a price book matching the requested currency', async () => {
      priceBookRepo.findOne.mockImplementation(async (options: any) => {
        const conds = Array.isArray(options.where) ? options.where : [options.where]
        const hasRetailUSD = conds.some((c: any) => c.type === PriceBookType.RETAIL && c.currency === 'USD')
        if (hasRetailUSD) {
          return { id: 'pb-usd', name: 'Retail USD', currency: 'USD', type: PriceBookType.RETAIL }
        }
        return null
      })

      productPriceRepo.find.mockResolvedValueOnce([
        { productId: 'prod-1', price: 10.0, minQuantity: 1 },
      ])

      const price = await service.getApplicablePrice('prod-1', null, 1, null, 'tenant-1', 'USD')
      expect(price).toBe(10.0)
    })

    it('should fall back to base currency price book and convert price if requested currency book is missing', async () => {
      priceBookRepo.findOne.mockImplementation(async (options: any) => {
        const conds = Array.isArray(options.where) ? options.where : [options.where]
        const hasRetailBDT = conds.some((c: any) => c.type === PriceBookType.RETAIL && c.currency === 'BDT')
        if (hasRetailBDT) {
          return { id: 'pb-bdt', name: 'Retail BDT', currency: 'BDT', type: PriceBookType.RETAIL }
        }
        return null
      })

      productPriceRepo.find.mockResolvedValueOnce([
        { productId: 'prod-1', price: 1200.0, minQuantity: 1 },
      ])

      const price = await service.getApplicablePrice('prod-1', null, 1, null, 'tenant-1', 'USD')
      expect(price).toBe(10.0)
    })
  })
})
