import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { PlatformSettingsRepository } from '@/modules/system/platform/platform-settings.repository'
import { ConfigService } from '@nestjs/config'
import { MailService } from './mail.service'
import * as nodemailer from 'nodemailer'

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
    close: jest.fn(),
  }),
}))

describe('MailService', () => {
  let service: MailService
  let settingsService: jest.Mocked<SettingsService>
  let platformRepo: jest.Mocked<PlatformSettingsRepository>
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    jest.clearAllMocks()

    const mockConfigService = {
      get: jest.fn((key, defaultValue) => {
        if (defaultValue !== undefined) return defaultValue
        if (key.includes('PORT')) return 587
        if (key.includes('SECURE')) return false
        return ''
      }),
    }
    const mockTenantRepo = {
      findByIdWithRelations: jest.fn(),
    }
    const mockSettingsService = {
      findByTenantSettings: jest.fn(),
    }
    const mockCacheService = {
      rememberCache: jest.fn((key, fn) => fn()),
    }
    const mockPlatformRepo = {
      findSettings: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TenantRepository,
          useValue: mockTenantRepo,
        },
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: PlatformSettingsRepository,
          useValue: mockPlatformRepo,
        },
      ],
    }).compile()

    service = module.get<MailService>(MailService)
    settingsService = module.get(SettingsService)
    platformRepo = module.get(PlatformSettingsRepository)
    configService = module.get(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendVerificationEmail', () => {
    it('should use tenant SMTP config if available', async () => {
      const mockSettings = {
        smtp: {
          host: 'smtp.tenant.com',
          port: 465,
          user: 'tenant-user',
          pass: 'tenant-pass',
          from: 'tenant@tenant.com',
        },
      }
      settingsService.findByTenantSettings.mockResolvedValue(mockSettings as any)

      await service.sendVerificationEmail('user@example.com', 'token-123', 'tenant-1')

      expect(settingsService.findByTenantSettings).toHaveBeenCalledWith({ tenantId: 'tenant-1' })
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.tenant.com',
          port: 465,
          secure: true,
          auth: {
            user: 'tenant-user',
            pass: 'tenant-pass',
          },
        }),
      )
    })

    it('should fall back to platform settings SMTP config if tenant SMTP is not available', async () => {
      settingsService.findByTenantSettings.mockResolvedValue(null as any)
      const mockPlatformSettings = {
        smtp: {
          host: 'smtp.platform.com',
          port: 587,
          user: 'platform-user',
          pass: 'platform-pass',
          from: 'platform@platform.com',
        },
      }
      platformRepo.findSettings.mockResolvedValue(mockPlatformSettings as any)

      await service.sendVerificationEmail('user@example.com', 'token-123', 'tenant-1')

      expect(platformRepo.findSettings).toHaveBeenCalled()
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.platform.com',
          port: 587,
          secure: false,
          auth: {
            user: 'platform-user',
            pass: 'platform-pass',
          },
        }),
      )
    })

    it('should fall back to env SMTP config if both tenant and platform SMTP are not available', async () => {
      settingsService.findByTenantSettings.mockResolvedValue(null as any)
      platformRepo.findSettings.mockResolvedValue(null as any)
      configService.get.mockImplementation((key, defaultValue) => {
        if (key === 'SMTP_HOST') return 'smtp.env.com'
        if (key === 'SMTP_PORT') return 1025
        if (key === 'SMTP_FROM') return 'env@env.com'
        if (defaultValue !== undefined) return defaultValue
        return ''
      })

      const mockTenantRepo = {
        findByIdWithRelations: jest.fn().mockResolvedValue(null),
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: ConfigService,
            useValue: configService,
          },
          {
            provide: TenantRepository,
            useValue: mockTenantRepo,
          },
          {
            provide: SettingsService,
            useValue: settingsService,
          },
          {
            provide: CacheService,
            useValue: { rememberCache: jest.fn((key, fn) => fn()) },
          },
          {
            provide: PlatformSettingsRepository,
            useValue: platformRepo,
          },
        ],
      }).compile()

      const newService = module.get<MailService>(MailService)
      await newService.sendVerificationEmail('user@example.com', 'token-123', 'tenant-1')

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.env.com',
          port: 1025,
          secure: false,
        }),
      )
    })
  })
})
