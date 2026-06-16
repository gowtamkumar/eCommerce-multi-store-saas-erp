import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { CategoryRepository } from './category.repository'
import { CategoryService } from './category.service'

describe('CategoryService', () => {
  let service: CategoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<CategoryService>(CategoryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
