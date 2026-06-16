import { Test, TestingModule } from '@nestjs/testing'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { ConfigService } from '@nestjs/config'
import { SmsService } from './sms.service'

describe('SmsService', () => {
  let service: SmsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
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
          provide: SettingsService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<SmsService>(SmsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
