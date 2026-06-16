import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { CogsService } from './cogs.service'

describe('CogsService', () => {
  let service: CogsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CogsService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<CogsService>(CogsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
