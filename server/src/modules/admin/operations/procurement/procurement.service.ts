import { Injectable, Logger } from '@nestjs/common'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ProcurementRepository } from './procurement.repository'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name)

  constructor(
    private readonly procurementRepo: ProcurementRepository,
    private readonly accountingService: AccountingService,
    private readonly auditLogService: AuditLogService,
    private readonly inventoryLedgerService: InventoryLedgerService,
  ) { }

  // --- Supplier Management ---
  async createSupplier(data: any, ctx: RequestContextDto) {
    const supplier = await this.procurementRepo.createSupplier({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Supplier',
      entityId: supplier.id,
      newValue: supplier,
    })
    return supplier
  }

  async getSuppliers(ctx: RequestContextDto) {
    return this.procurementRepo.findAllSuppliers(ctx.tenantId)
  }

  // --- Purchase Order Lifecycle ---
  async createPurchaseOrder(data: any, ctx: RequestContextDto) {
    const po = await this.procurementRepo.createPO({
      ...data,
      tenantId: ctx.tenantId,
      poNumber: `PO-${Date.now()}`,
    })

    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'PurchaseOrder',
      entityId: po.id,
      newValue: po,
    })
    return po
  }

  // --- Goods Receiving & Financial Settlement ---
  async processGRN(data: any, ctx: RequestContextDto) {
    const grn = await this.procurementRepo.createGRN({
      ...data,
      tenantId: ctx.tenantId,
      grnNumber: `GRN-${Date.now()}`,
    })

    const po = await this.procurementRepo.findPOById(data.poId, ctx.tenantId)
    if (!po) throw new Error('Purchase Order not found')

    // 1. Calculate total value received
    const totalReceivedValue = grn.receivedItems.reduce(
      (sum, item) => sum + (item.quantityAccepted * item.unitPrice), 0
    )

    // 2. Update Physical Inventory & Financial Ledger (Automated Sync)
    for (const item of grn.receivedItems) {
      await this.inventoryLedgerService.createLedgerEntry({
        productId: item.productId,
        warehouseId: grn.warehouseId,
        quantity: item.quantityAccepted,
        unitCost: item.unitPrice,
        type: InventoryTransactionType.PURCHASE,
        referenceId: grn.id,
        referenceType: InventoryTransactionReferenceType.GOODS_RECEIVED_NOTE,
        remarks: `GRN Intake: ${grn.grnNumber} from ${po.supplier.name}`,
      }, ctx)
    }

    // 3. Update Supplier Balance
    await this.procurementRepo.supplierRepo.update(po.supplierId, {
      currentBalance: Number(po.supplier.currentBalance) + totalReceivedValue
    })

    // 4. Update PO Status
    await this.procurementRepo.updatePOStatus(po.id, 'RECEIVED')

    await this.auditLogService.log(ctx, {
      action: 'RECEIVE_GOODS',
      entity: 'GRN',
      entityId: grn.id,
      newValue: grn,
    })

    return grn
  }
}
