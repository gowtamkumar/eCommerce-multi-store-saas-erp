import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { LoyaltyService } from './loyalty.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { ReferralService } from './referral.service'

describe('ReferralService', () => {
  let service: ReferralService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: LoyaltyService,
          useValue: {},
        },
        {
          provide: WalletService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ReferralService>(ReferralService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
