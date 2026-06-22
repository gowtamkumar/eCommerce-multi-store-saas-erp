import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { TaxService } from './tax.service'
import { TaxCategory } from '../entities/tax-rule.entity'

describe('TaxService', () => {
  let service: TaxService
  let mockFindOneSettings: jest.Mock
  let mockFindOneRule: jest.Mock

  beforeEach(async () => {
    mockFindOneSettings = jest.fn()
    mockFindOneRule = jest.fn()

    const mockRepo = {
      findOne: jest.fn((options) => {
        // Distinguish Settings query vs TaxRule query by looking at the target table or query properties
        if (options?.where?.hasOwnProperty('locale') || (options?.where?.hasOwnProperty('tenantId') && !options?.where?.hasOwnProperty('country'))) {
          return mockFindOneSettings(options)
        }
        return mockFindOneRule(options)
      }),
      count: jest.fn().mockResolvedValue(0),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        {
          provide: DataSource,
          useValue: {
            manager: {
              getRepository: jest.fn().mockReturnValue(mockRepo),
            },
            getRepository: jest.fn().mockReturnValue(mockRepo),
          },
        },
      ],
    }).compile()

    service = module.get<TaxService>(TaxService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('calculateTax', () => {
    it('should resolve US ZIP codes to CA state and return standard rate', async () => {
      mockFindOneSettings.mockResolvedValue({ locale: 'en-US' })
      mockFindOneRule.mockResolvedValue(null) // force fallback

      const ctx = { tenantId: 'tenant-1' } as any
      const result = await service.calculateTax(ctx, {
        country: 'US',
        state: '90210', // Beverly Hills, CA
        baseAmount: 100,
        category: TaxCategory.STANDARD,
      })

      expect(result.rate).toBe(8.25)
      expect(result.taxAmount).toBe(8.25)
      expect(result.totalAmount).toBe(108.25)
      expect(result.ruleName).toContain('US CA')
    })

    it('should apply EU VAT reverse charge (0%) for cross-border EU transactions', async () => {
      // Germany tenant (DE), France customer (FR)
      mockFindOneSettings.mockResolvedValue({ locale: 'de-DE' })

      const ctx = { tenantId: 'tenant-1' } as any
      const result = await service.calculateTax(ctx, {
        country: 'FR',
        state: '',
        baseAmount: 200,
        category: TaxCategory.STANDARD,
      })

      expect(result.rate).toBe(0)
      expect(result.taxAmount).toBe(0)
      expect(result.totalAmount).toBe(200)
      expect(result.ruleName).toBe('EU VAT Reverse Charge (0%)')
    })

    it('should apply standard VAT if EU transaction is domestic', async () => {
      // Germany tenant (DE), Germany customer (DE)
      mockFindOneSettings.mockResolvedValue({ locale: 'de-DE' })
      mockFindOneRule.mockResolvedValue({
        name: 'DE Standard VAT',
        rate: 19.0,
      })

      const ctx = { tenantId: 'tenant-1' } as any
      const result = await service.calculateTax(ctx, {
        country: 'DE',
        state: '',
        baseAmount: 100,
        category: TaxCategory.STANDARD,
      })

      expect(result.rate).toBe(19.0)
      expect(result.taxAmount).toBe(19.0)
      expect(result.totalAmount).toBe(119.0)
      expect(result.ruleName).toBe('DE Standard VAT')
    })
  })
})
