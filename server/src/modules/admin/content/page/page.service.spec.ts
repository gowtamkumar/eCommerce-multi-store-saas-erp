import { Test, TestingModule } from '@nestjs/testing'
import { PageService } from './page.service'
import { PageRepository } from './page.repository'
import { PageRevisionRepository } from './page-revision.repository'
import { FaqService } from '@/modules/admin/content/faq/faq.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'

describe('PageService', () => {
  let service: PageService
  let pageRepository: any

  const mockContext: RequestContextDto = {
    tenantId: 'test-tenant',
    userId: 'test-user',
  } as any

  beforeEach(async () => {
    pageRepository = {
      findBySlug: jest.fn(),
      createAndSave: jest.fn().mockImplementation((p) => Promise.resolve(p)),
      unsetHomePage: jest.fn(),
    }
    const mockPageRevisionRepository = {}
    const mockFaqService = {}
    const mockCacheService = {
      invalidatePageCache: jest.fn(),
      delCache: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageService,
        {
          provide: PageRepository,
          useValue: pageRepository,
        },
        {
          provide: PageRevisionRepository,
          useValue: mockPageRevisionRepository,
        },
        {
          provide: FaqService,
          useValue: mockFaqService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile()

    service = module.get<PageService>(PageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createPage slug generation', () => {
    it('should use explicit slug if provided', async () => {
      pageRepository.findBySlug.mockResolvedValue(null)
      const res = await service.createPage(
        {
          title: 'Custom Title',
          slug: 'custom-slug',
        },
        mockContext,
      )
      expect(res.slug).toBe('custom-slug')
    })

    it('should generate slug from title if slug is not provided', async () => {
      pageRepository.findBySlug.mockResolvedValue(null)
      const res = await service.createPage(
        {
          title: 'Hello World Page!',
        } as any,
        mockContext,
      )
      expect(res.slug).toBe('hello-world-page')
    })

    it('should generate slug from title if slug is explicitly empty', async () => {
      pageRepository.findBySlug.mockResolvedValue(null)
      const res = await service.createPage(
        {
          title: 'Another Awesome Page',
          slug: '   ',
        },
        mockContext,
      )
      expect(res.slug).toBe('another-awesome-page')
    })

    it('should keep slug empty for home page', async () => {
      pageRepository.findBySlug.mockResolvedValue(null)
      const res = await service.createPage(
        {
          title: 'My Store Home',
          slug: 'home-slug-ignored',
          isHomePage: true,
        },
        mockContext,
      )
      expect(res.slug).toBe('')
    })
  })
})
