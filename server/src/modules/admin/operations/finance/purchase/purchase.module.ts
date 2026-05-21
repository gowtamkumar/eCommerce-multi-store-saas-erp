import { BullModule } from '@nestjs/bullmq'
import { Module, forwardRef } from '@nestjs/common'
import { InventoryLedgerModule } from '../../logistics/inventory-transaction/inventory-transaction.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { GrnModule } from '@/modules/admin/operations/logistics/grn/grn.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { AccountingModule } from '../accounting/accounting.module'

// Controllers
import { PurchaseOrderController } from './controllers/purchase-order.controller'
import { PurchaseRequisitionController } from './controllers/purchase-requisition.controller'
import { RfqController } from './controllers/rfq.controller'
import { DebitNoteController } from './controllers/debit-note.controller'
import { SupplierInvoiceController } from './controllers/supplier-invoice.controller'

// Services
import { PurchaseOrderService } from './services/purchase-order.service'
import { PurchaseRequisitionService } from './services/purchase-requisition.service'
import { RfqService } from './services/rfq.service'
import { DebitNoteService } from './services/debit-note.service'
import { SupplierInvoiceService } from './services/supplier-invoice.service'

// Repositories
import { PurchaseOrderRepository } from './repositories/purchase-order.repository'
import { SupplierPaymentRepository } from './repositories/supplier-payment.repository'
import { PurchaseRequisitionRepository } from './repositories/purchase-requisition.repository'
import { RfqRepository } from './repositories/rfq.repository'
import { QuotationRepository } from './repositories/quotation.repository'
import { DebitNoteRepository } from './repositories/debit-note.repository'
import { SupplierInvoiceRepository } from './repositories/supplier-invoice.repository'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'product' }),
    InventoryLedgerModule,
    TenantModule,
    forwardRef(() => GrnModule),
    NotificationModule,
    AccountingModule,
  ],
  controllers: [
    PurchaseOrderController,
    PurchaseRequisitionController,
    RfqController,
    DebitNoteController,
    SupplierInvoiceController,
  ],
  providers: [
    // Services
    PurchaseOrderService,
    PurchaseRequisitionService,
    RfqService,
    DebitNoteService,
    SupplierInvoiceService,

    // Repositories
    PurchaseOrderRepository,
    SupplierPaymentRepository,
    PurchaseRequisitionRepository,
    RfqRepository,
    QuotationRepository,
    DebitNoteRepository,
    SupplierInvoiceRepository,
  ],
  exports: [
    PurchaseOrderService,
    PurchaseRequisitionService,
    RfqService,
    DebitNoteService,
    SupplierInvoiceService,
  ],
})
export class PurchaseModule {}
