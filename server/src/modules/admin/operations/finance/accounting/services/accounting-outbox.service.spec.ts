import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AccountingService } from './accounting.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AccountingOutboxService } from './accounting-outbox.service'

describe('AccountingOutboxService', () => {
  let service: AccountingOutboxService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingOutboxService,
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
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<AccountingOutboxService>(AccountingOutboxService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
