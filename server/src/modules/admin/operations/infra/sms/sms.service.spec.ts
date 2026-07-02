import { Test, TestingModule } from '@nestjs/testing'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { PlatformSettingsRepository } from '@/modules/system/platform/platform-settings.repository'
import { ConfigService } from '@nestjs/config'
import { SmsService } from './sms.service'
import axios from 'axios'

jest.mock('axios')

describe('SmsService', () => {
  let service: SmsService
  let settingsService: jest.Mocked<SettingsService>
  let platformRepo: jest.Mocked<PlatformSettingsRepository>
  let configService: jest.Mocked<ConfigService>

  beforeEach(async () => {
    jest.clearAllMocks()

    const mockConfigService = {
      get: jest.fn((key, defaultValue) => {
        if (defaultValue !== undefined) return defaultValue
        return ''
      }),
    }
    const mockSettingsService = {
      findByStoreSettings: jest.fn(),
    }
    const mockPlatformRepo = {
      findSettings: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
        {
          provide: PlatformSettingsRepository,
          useValue: mockPlatformRepo,
        },
      ],
    }).compile()

    service = module.get<SmsService>(SmsService)
    settingsService = module.get(SettingsService)
    platformRepo = module.get(PlatformSettingsRepository)
    configService = module.get(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendSms', () => {
    it('should use store SMS credentials if available', async () => {
      const mockSettings = {
        sms: {
          apiKey: 'store-api-key',
          senderId: 'store-sender-id',
        },
      }
      settingsService.findByStoreSettings.mockResolvedValue(mockSettings as any)
      const mockAxiosPost = axios.post as jest.Mock
      mockAxiosPost.mockResolvedValue({ data: { response_code: 202, message_id: 'msg-123' } })

      const result = await service.sendSms('123456789', 'Hello', 'store-1')

      expect(settingsService.findByStoreSettings).toHaveBeenCalledWith({ storeId: 'store-1' })
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bulksmsbd.net/api/smsapi',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            api_key: 'store-api-key',
            senderid: 'store-sender-id',
            number: '123456789',
            message: 'Hello',
          }),
        }),
      )
      expect(result).toEqual({ success: true, messageId: 'msg-123' })
    })

    it('should fall back to platform settings SMS credentials if store config is not available', async () => {
      settingsService.findByStoreSettings.mockResolvedValue(null as any)
      const mockPlatformSettings = {
        sms: {
          apiKey: 'platform-api-key',
          senderId: 'platform-sender-id',
        },
      }
      platformRepo.findSettings.mockResolvedValue(mockPlatformSettings as any)
      const mockAxiosPost = axios.post as jest.Mock
      mockAxiosPost.mockResolvedValue({ data: { response_code: 202, message_id: 'msg-456' } })

      const result = await service.sendSms('123456789', 'Hello', 'store-1')

      expect(platformRepo.findSettings).toHaveBeenCalled()
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bulksmsbd.net/api/smsapi',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            api_key: 'platform-api-key',
            senderid: 'platform-sender-id',
            number: '123456789',
            message: 'Hello',
          }),
        }),
      )
      expect(result).toEqual({ success: true, messageId: 'msg-456' })
    })

    it('should fall back to env settings SMS credentials if both store and platform configs are absent', async () => {
      settingsService.findByStoreSettings.mockResolvedValue(null as any)
      platformRepo.findSettings.mockResolvedValue(null as any)
      configService.get.mockImplementation((key) => {
        if (key === 'BULKSMSBD_API_KEY') return 'env-api-key'
        if (key === 'BULKSMSBD_SENDER_ID') return 'env-sender-id'
        return ''
      })
      const mockAxiosPost = axios.post as jest.Mock
      mockAxiosPost.mockResolvedValue({ data: { response_code: 202, message_id: 'msg-789' } })

      const result = await service.sendSms('123456789', 'Hello', 'store-1')

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bulksmsbd.net/api/smsapi',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            api_key: 'env-api-key',
            senderid: 'env-sender-id',
            number: '123456789',
            message: 'Hello',
          }),
        }),
      )
      expect(result).toEqual({ success: true, messageId: 'msg-789' })
    })
  })
})
