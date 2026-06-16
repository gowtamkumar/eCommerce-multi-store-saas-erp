import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AccountingService } from './accounting.service'
import { ArService } from './ar.service'

describe('ArService', () => {
  let service: ArService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: AccountingService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ArService>(ArService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
