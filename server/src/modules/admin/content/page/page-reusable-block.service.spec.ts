import { Test, TestingModule } from '@nestjs/testing'
import { PageReusableBlockRepository } from './page-reusable-block.repository'
import { PageReusableBlockService } from './page-reusable-block.service'

describe('PageReusableBlockService', () => {
  let service: PageReusableBlockService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageReusableBlockService,
        {
          provide: PageReusableBlockRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PageReusableBlockService>(PageReusableBlockService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
