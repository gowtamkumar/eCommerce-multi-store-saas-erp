import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { DunningService } from './dunning.service'

describe('DunningService', () => {
  let service: DunningService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DunningService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<DunningService>(DunningService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
