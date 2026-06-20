import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { SiteSettingsRepository } from './site-settings.repository'
import { SettingsService } from './settings.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BASIC_DEFAULT_SETTINGS } from './settings.constants'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'

describe('SettingsService', () => {
  let service: SettingsService
  let settingsRepo: jest.Mocked<any>
  let tenantRepo: jest.Mocked<any>
  let cacheService: jest.Mocked<any>

  const mockCtx: RequestContextDto = {
    tenantId: 'tenant-123',
    userId: 'user-456',
  } as any

  beforeEach(async () => {
    settingsRepo = {
      findByTenantId: jest.fn(),
      createAndSave: jest.fn(),
      updateAndSave: jest.fn(),
    }
    tenantRepo = {
      findByIdWithRelations: jest.fn(),
    }
    cacheService = {
      rememberCache: jest.fn().mockImplementation((key, cb) => cb()),
      delCache: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: SiteSettingsRepository, useValue: settingsRepo },
        { provide: TenantRepository, useValue: tenantRepo },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile()

    service = module.get<SettingsService>(SettingsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createSetting', () => {
    it('should create site settings using BASIC_DEFAULT_SETTINGS as base and merging user overrides in correct order', async () => {
      settingsRepo.findByTenantId.mockResolvedValue(null)
      settingsRepo.createAndSave.mockImplementation((dto) => Promise.resolve(dto))

      const userDto = {
        brandName: 'Custom Brand',
        contactEmail: 'custom@example.com',
        siteDescription: 'Custom description',
      }

      const result = await service.createSetting(mockCtx, userDto)

      // Verify that user overrides won over default settings
      expect(result.brandName).toBe('Custom Brand')
      expect(result.contactEmail).toBe('custom@example.com')
      expect(result.siteDescription).toBe('Custom description')

      // Verify that default values for basic settings were set, while complex settings remain undefined
      expect(result.currency).toBe(BASIC_DEFAULT_SETTINGS.currency)
      expect(result.theme).toBeUndefined()
      expect(settingsRepo.createAndSave).toHaveBeenCalled()
    })

    it('should return existing settings and merge overrides if already exists (idempotent)', async () => {
      const existingSettings = {
        tenantId: 'tenant-123',
        brandName: 'Existing Brand',
        theme: { mode: 'dark' },
      } as unknown as SiteSettingsEntity

      settingsRepo.findByTenantId.mockResolvedValue(existingSettings)
      settingsRepo.updateAndSave.mockImplementation((entity, dto) =>
        Promise.resolve({ ...entity, ...dto }),
      )

      const userDto = {
        brandName: 'Updated Brand',
      }

      const result = await service.createSetting(mockCtx, userDto)

      expect(result.brandName).toBe('Updated Brand')
      expect(settingsRepo.updateAndSave).toHaveBeenCalledWith(
        existingSettings,
        expect.any(Object),
        undefined,
      )
      expect(settingsRepo.createAndSave).not.toHaveBeenCalled()
    })
  })

  describe('findByTenantSettings', () => {
    it('should return settings from repository and append tenant status', async () => {
      const mockSettings = {
        tenantId: 'tenant-123',
        brandName: 'Saved Brand',
        theme: { mode: 'dark' },
        currency: 'BDT',
      } as unknown as SiteSettingsEntity

      settingsRepo.findByTenantId.mockResolvedValue(mockSettings)
      tenantRepo.findByIdWithRelations.mockResolvedValue({
        id: 'tenant-123',
        status: TenantStatus.ACTIVE,
        isExpired: false,
      })

      const result = await service.findByTenantSettings(mockCtx)

      expect(result.status).toBe(TenantStatus.ACTIVE)
      expect(result.brandName).toBe('Saved Brand')
      expect(result.currency).toBe('BDT')
      expect(result.theme).toEqual({ mode: 'dark' })
    })

    it('should lazy-create defaults if no settings row is found in DB', async () => {
      settingsRepo.findByTenantId.mockResolvedValueOnce(null) // first call (lookup)
      tenantRepo.findByIdWithRelations.mockResolvedValue({
        id: 'tenant-123',
        status: TenantStatus.ACTIVE,
      })

      // Stub createSetting response
      const createdSettings = {
        tenantId: 'tenant-123',
        brandName: BASIC_DEFAULT_SETTINGS.brandName,
      } as unknown as SiteSettingsEntity
      settingsRepo.createAndSave.mockResolvedValue(createdSettings)

      const result = await service.findByTenantSettings(mockCtx)

      // Should have triggered createSetting with empty DTO
      expect(settingsRepo.createAndSave).toHaveBeenCalled()
      expect(result.brandName).toBe(BASIC_DEFAULT_SETTINGS.brandName)
      expect(result.status).toBe(TenantStatus.ACTIVE)
    })
  })
})
