import { Test, TestingModule } from '@nestjs/testing'
import { WarehouseBinRepository } from '../repositories/warehouse-bin.repository'
import { WarehouseRepository } from '../repositories/warehouse.repository'
import { WarehouseService } from './warehouse.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

describe('WarehouseService', () => {
  let service: WarehouseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        {
          provide: WarehouseRepository,
          useValue: {},
        },
        {
          provide: WarehouseBinRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {
            rememberCache: jest.fn((key, cb) => cb()),
            delCache: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<WarehouseService>(WarehouseService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
