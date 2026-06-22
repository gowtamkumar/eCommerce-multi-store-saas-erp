import { Test, TestingModule } from '@nestjs/testing'
import { CurrencyFeedService } from './currency-feed.service'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('CurrencyFeedService', () => {
  let service: CurrencyFeedService

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        rates: {
          USD: 1.0,
          EUR: 0.92,
          GBP: 0.79,
          INR: 83.50,
          BDT: 117.50,
        }
      }
    })
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyFeedService],
    }).compile()

    service = module.get<CurrencyFeedService>(CurrencyFeedService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getExchangeRate', () => {
    it('should return 1.0 for same currencies', async () => {
      const rate = await service.getExchangeRate('USD', 'USD')
      expect(rate).toBe(1.0)
    })

    it('should return correct relative conversion rate', async () => {
      // Mock rates: USD=1.0, EUR=0.92, BDT=117.50
      // EUR -> USD is 1/0.92 = 1.086957
      // USD -> BDT is 117.50
      // EUR -> BDT is (1/0.92) * 117.50 = 127.717391
      const rate = await service.getExchangeRate('EUR', 'BDT')
      expect(rate).toBeCloseTo(127.717391, 2)
    })

    it('should return 1.0 fallback for unregistered currencies', async () => {
      const rate = await service.getExchangeRate('XXX', 'YYY')
      expect(rate).toBe(1.0)
    })
  })

  describe('updateRatesFeed', () => {
    it('should fetch and update rates successfully from live api', async () => {
      const mockRates = {
        USD: 1.0,
        EUR: 0.90,
        GBP: 0.75,
        INR: 80.00,
        BDT: 110.00,
      }
      mockedAxios.get.mockResolvedValueOnce({ data: { rates: mockRates } })

      await service.updateRatesFeed()
      const rate = await service.getExchangeRate('USD', 'EUR')
      expect(rate).toBe(0.90)
    })

    it('should apply mock variance on api failure', async () => {
      const initialRate = await service.getExchangeRate('USD', 'EUR')
      mockedAxios.get.mockRejectedValueOnce(new Error('API Down'))
      
      await service.updateRatesFeed()
      const updatedRate = await service.getExchangeRate('USD', 'EUR')
      // Rates should be within a +/-0.5% margin of the initial rate
      expect(updatedRate).toBeGreaterThan(initialRate * 0.99)
      expect(updatedRate).toBeLessThan(initialRate * 1.01)
    })
  })
})
