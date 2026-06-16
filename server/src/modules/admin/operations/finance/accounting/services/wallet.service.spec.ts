import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AccountingService } from './accounting.service'
import { WalletService } from './wallet.service'

describe('WalletService', () => {
  let service: WalletService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
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

    service = module.get<WalletService>(WalletService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
