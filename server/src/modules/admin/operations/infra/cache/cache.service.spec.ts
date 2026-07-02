import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from './cache.service'
import { CacheRepository } from './cache.repository'

describe('CacheService Exclusions', () => {
  let service: CacheService
  let mockRepository: jest.Mocked<CacheRepository>

  beforeEach(async () => {
    mockRepository = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
      delByPattern: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CacheRepository,
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<CacheService>(CacheService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('isExcluded check', () => {
    const excludedKeys = [
      'pos:register:123',
      'shift:close',
      'drawer:open',
      'tender:split',
      'z-report:daily',
      'zreport',
      'cart:get',
      'checkout:calculate',
      'atp:stock:check',
      'stockcheck:product-1',
      'stock-level:check',
      'otp:send',
      'verification:email',
      'email-token:verify',
      'reset-password:request',
      'forgot-password:email',
      'auth-route:login',
    ]

    const allowedKeys = [
      'products:list:all',
      'categories:list',
      'store:gowtam:settings',
      'brands:list',
      'analytics:revenue',
      'courier:pathao:token', // contains 'token' but not verification/email/auth
    ]

    it('should block GET for excluded keys', async () => {
      for (const key of excludedKeys) {
        const result = await service.getCache(key)
        expect(result).toBeNull()
        expect(mockRepository.get).not.toHaveBeenCalled()
      }
    })

    it('should block SET for excluded keys', async () => {
      for (const key of excludedKeys) {
        await service.setCache(key, { data: 'test' })
        expect(mockRepository.set).not.toHaveBeenCalled()
      }
    })

    it('should bypass rememberCache for excluded keys and call fetcher directly', async () => {
      for (const key of excludedKeys) {
        const fetcher = jest.fn().mockResolvedValue('fresh_data')
        const result = await service.rememberCache(key, fetcher)

        expect(result).toBe('fresh_data')
        expect(fetcher).toHaveBeenCalled()
        expect(mockRepository.get).not.toHaveBeenCalled()
        expect(mockRepository.set).not.toHaveBeenCalled()
      }
    })

    it('should allow GET, SET, and rememberCache for normal allowed keys', async () => {
      mockRepository.get.mockResolvedValue(null)
      mockRepository.set.mockResolvedValue(undefined)

      for (const key of allowedKeys) {
        // 1. GET
        await service.getCache(key, 'store-1')
        expect(mockRepository.get).toHaveBeenCalled()
        mockRepository.get.mockClear()

        // 2. SET
        await service.setCache(key, 'val', 300, 'store-1')
        expect(mockRepository.set).toHaveBeenCalled()
        mockRepository.set.mockClear()

        // 3. REMEMBER
        const fetcher = jest.fn().mockResolvedValue('fresh')
        const result = await service.rememberCache(key, fetcher, 300, 'store-1')
        expect(result).toBe('fresh')
        expect(mockRepository.get).toHaveBeenCalled()
        expect(mockRepository.set).toHaveBeenCalled()
        mockRepository.get.mockClear()
        mockRepository.set.mockClear()
      }
    })
  })
})
