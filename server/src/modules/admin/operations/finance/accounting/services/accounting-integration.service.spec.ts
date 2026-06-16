import { Test, TestingModule } from '@nestjs/testing'
import { AccountingService } from './accounting.service'
import { AccountingOutboxService } from './accounting-outbox.service'
import { AccountingIntegrationService } from './accounting-integration.service'

describe('AccountingIntegrationService', () => {
  let service: AccountingIntegrationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingIntegrationService,
        {
          provide: AccountingService,
          useValue: {},
        },
        {
          provide: AccountingOutboxService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<AccountingIntegrationService>(AccountingIntegrationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
