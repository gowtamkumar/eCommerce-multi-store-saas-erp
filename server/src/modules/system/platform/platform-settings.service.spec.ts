import { Test, TestingModule } from '@nestjs/testing'
import { PlatformSettingsRepository } from './platform-settings.repository'
import { PlatformSettingsService } from './platform-settings.service'

describe('PlatformSettingsService', () => {
  let service: PlatformSettingsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformSettingsService,
        {
          provide: PlatformSettingsRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PlatformSettingsService>(PlatformSettingsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
