import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { MinioService } from './minio.service'

describe('MinioService', () => {
  let service: MinioService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
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
      ],
    }).compile()

    service = module.get<MinioService>(MinioService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
