import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AccountingService } from './accounting.service'

describe('AccountingService', () => {
  let service: AccountingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<AccountingService>(AccountingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
