import { Test, TestingModule } from '@nestjs/testing'
import { AddonCatalogRepository } from './addon-catalog.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { AddonCatalogService } from './addon-catalog.service'

describe('AddonCatalogService', () => {
  let service: AddonCatalogService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddonCatalogService,
        {
          provide: AddonCatalogRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<AddonCatalogService>(AddonCatalogService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
