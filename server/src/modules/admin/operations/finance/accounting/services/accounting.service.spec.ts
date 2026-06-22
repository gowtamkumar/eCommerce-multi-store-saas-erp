import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AccountingService } from './accounting.service'
import { CurrencyFeedService } from './currency-feed.service'

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
        {
          provide: CurrencyFeedService,
          useValue: {
            getExchangeRate: jest.fn().mockResolvedValue(1.0),
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
