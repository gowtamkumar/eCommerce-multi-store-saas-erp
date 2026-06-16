import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PaymentRepository } from '../repositories/payment.repository'
import { PaymentService } from './payment.service'

describe('PaymentService', () => {
  let service: PaymentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: OrderRepository,
          useValue: {},
        },
        {
          provide: PaymentRepository,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: InvoiceService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: AuditLogService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<PaymentService>(PaymentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
