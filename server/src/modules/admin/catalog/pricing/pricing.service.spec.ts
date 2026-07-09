import { Test, TestingModule } from '@nestjs/testing'
import { PricingService } from './pricing.service'
import { PriceBookType } from './enums/price-book-type.enum'
import { PriceBookRepository } from './repositories/price-book.repository'
import { ProductPriceRepository } from './repositories/product-price.repository'

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

    const mockPriceBookRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      txRepo: jest.fn().mockReturnValue({
        manager: {
          getRepository: jest.fn().mockReturnValue(siteSettingsRepo),
        },
      }),
    }

    const mockProductPriceRepo = {
      find: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PriceBookRepository,
          useValue: mockPriceBookRepo,
        },
        {
          provide: ProductPriceRepository,
          useValue: mockProductPriceRepo,
        },
      ],
    }).compile()

    service = module.get<PricingService>(PricingService)
    priceBookRepo = module.get(PriceBookRepository)
    productPriceRepo = module.get(ProductPriceRepository)
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

      const price = await service.getApplicablePrice('prod-1', null, 1, null, 'store-1', 'USD')
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

      const price = await service.getApplicablePrice('prod-1', null, 1, null, 'store-1', 'USD')
      expect(price).toBe(10.0)
    })
  })
})
