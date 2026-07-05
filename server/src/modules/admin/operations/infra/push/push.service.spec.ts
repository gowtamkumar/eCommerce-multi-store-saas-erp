import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { PushService } from './push.service'
import { DeviceRepository } from './repositories/device.repository'

describe('PushService', () => {
  let service: PushService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
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
          provide: DeviceRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<PushService>(PushService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
