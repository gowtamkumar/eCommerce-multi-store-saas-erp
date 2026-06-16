import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { ConfigService } from '@nestjs/config'
import { MailService } from './mail.service'

describe('MailService', () => {
  let service: MailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
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
          provide: TenantRepository,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<MailService>(MailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
