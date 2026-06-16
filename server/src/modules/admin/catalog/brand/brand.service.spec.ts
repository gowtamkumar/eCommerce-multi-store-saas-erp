import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { BrandRepository } from './brand.repository'
import { BrandService } from './brand.service'

describe('BrandService', () => {
  let service: BrandService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: BrandRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<BrandService>(BrandService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
