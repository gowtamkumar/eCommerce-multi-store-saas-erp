import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ExpenseRepository } from './expense.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { ExpenseService } from './expense.service'

describe('ExpenseService', () => {
  let service: ExpenseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: ExpenseRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ExpenseService>(ExpenseService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
