import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ProductService } from '@/modules/admin/catalog/product/services/product.service'
import { PageService } from '@/modules/admin/content/page/page.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { ExpenseService } from '@/modules/admin/operations/finance/expense/expense.service'
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/services/purchase-order.service'
import { SupplierService } from '@/modules/admin/operations/finance/supplier/supplier.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { PaymentService } from '@/modules/admin/sales/payment/services/payment.service'
import { ReportRepository } from './report.repository'
import { ReportService } from './report.service'

describe('ReportService', () => {
  let service: ReportService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: ProductService,
          useValue: {},
        },
        {
          provide: OrderService,
          useValue: {},
        },
        {
          provide: PageService,
          useValue: {},
        },
        {
          provide: PaymentService,
          useValue: {},
        },
        {
          provide: SupplierService,
          useValue: {},
        },
        {
          provide: PurchaseOrderService,
          useValue: {},
        },
        {
          provide: ExpenseService,
          useValue: {},
        },
        {
          provide: ReportRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<ReportService>(ReportService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
