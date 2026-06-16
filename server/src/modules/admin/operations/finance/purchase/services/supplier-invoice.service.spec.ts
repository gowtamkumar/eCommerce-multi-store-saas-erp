import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { SupplierInvoiceRepository } from '../repositories/supplier-invoice.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository'
import { SupplierPaymentRepository } from '../repositories/supplier-payment.repository'
import { SupplierInvoiceService } from './supplier-invoice.service'

describe('SupplierInvoiceService', () => {
  let service: SupplierInvoiceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierInvoiceService,
        {
          provide: SupplierInvoiceRepository,
          useValue: {},
        },
        {
          provide: PurchaseOrderRepository,
          useValue: {},
        },
        {
          provide: SupplierPaymentRepository,
          useValue: {},
        },
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<SupplierInvoiceService>(SupplierInvoiceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
