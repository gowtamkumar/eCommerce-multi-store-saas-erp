import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { PathaoService } from './pathao.service'

describe('PathaoService', () => {
  let service: PathaoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PathaoService,
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
          provide: HttpService,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: OrderService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PathaoService>(PathaoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
