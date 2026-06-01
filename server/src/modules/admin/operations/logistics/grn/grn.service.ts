import { Inject, Injectable, Logger, BadRequestException, forwardRef } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { GrnRepository } from './grn.repository'
import { CreateGrnDto, VerifyGrnDto } from './dto/grn.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { GoodsReceivedNoteEntity } from './entities/grn.entity'
import { GrnStatus } from '@/common/enums/grn-status.enum'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { SupplierAPLedgerRepository } from '@/modules/admin/operations/finance/supplier/supplier-ap-ledger.repository'
import { SupplierAPReferenceType } from '../../finance/supplier/enums/supplier-ap-Refernce-type.enum'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'

@Injectable()
export class GrnService {
  private readonly logger = new Logger(GrnService.name)

  constructor(
    private readonly repository: GrnRepository,
    private readonly dataSource: DataSource,
    private readonly apLedgerRepository: SupplierAPLedgerRepository,
    @Inject(forwardRef(() => InventoryLedgerService))
    private readonly inventoryLedgerService: InventoryLedgerService,
  ) {}

  async createGrn(dto: CreateGrnDto, ctx: RequestContextDto): Promise<GoodsReceivedNoteEntity> {
    this.logger.log(`${this.createGrn.name} Service Called`)
    const grnNumber = await this.repository.generateGrnNumber(ctx.tenantId)
    return this.repository.createAndSave(dto, grnNumber, ctx)
  }

  async verifyGrn(
    id: string,
    dto: VerifyGrnDto,
    ctx: RequestContextDto,
  ): Promise<GoodsReceivedNoteEntity> {
    this.logger.log(`${this.verifyGrn.name} Service Called`)

    const grn = await this.repository.findById(id, ctx.tenantId)

    if (grn.status !== GrnStatus.DRAFT) {
      throw new BadRequestException(`GRN is already ${grn.status}`)
    }

    if (dto.status === GrnStatus.REJECTED) {
      grn.status = GrnStatus.REJECTED
      grn.notes = dto.notes || grn.notes
      return this.repository.save(grn)
    }

    if (dto.status === GrnStatus.RECEIVED) {
      // Single atomic transaction: GRN status + AP ledger + inventory ledger
      // either ALL succeed or ALL roll back. No more async queue gap that could
      // leave AP incremented without matching stock.
      return this.dataSource.transaction(async (manager) => {
        grn.status = GrnStatus.RECEIVED
        grn.notes = dto.notes || grn.notes
        const savedGrn = await this.repository.save(grn, manager)

        let totalGrnCost = 0

        // 1. Inventory writes — synchronous & inside the same transaction.
        for (const item of grn.items) {
          totalGrnCost += Number(item.receivedQty) * Number(item.unitCost)

          if (item.receivedQty > 0) {
            await this.inventoryLedgerService.createLedgerEntry(
              {
                productId: item.productId,
                variantId: item.variantId || undefined,
                quantity: item.receivedQty,
                type: InventoryTransactionType.PURCHASE,
                referenceType: InventoryTransactionReferenceType.GOODS_RECEIVED_NOTE,
                referenceId: grn.id,
                supplierId: grn.supplierId,
                unitCost: item.unitCost,
                warehouseId: grn.warehouseId,
                branchId: grn.branchId,
              },
              ctx,
              manager,
            )
          }
        }

        // 2. Update Supplier Accounts Payable Ledger
        if (totalGrnCost > 0) {
          await this.apLedgerRepository.createEntry(
            {
              supplierId: grn.supplierId,
              tenantId: ctx.tenantId,
              referenceType: SupplierAPReferenceType.GRN,
              referenceId: grn.id,
              credit: totalGrnCost,
              remarks: `GRN Verification: ${grn.grnNumber}`,
            },
            manager,
          )
        }

        return savedGrn
      })
    }

    return grn
  }

  async findById(id: string, ctx: RequestContextDto): Promise<GoodsReceivedNoteEntity> {
    return this.repository.findById(id, ctx.tenantId)
  }

  async findAll(ctx: RequestContextDto, paginationDto: PaginationDto, status?: GrnStatus) {
    return this.repository.findAll(ctx.tenantId, paginationDto, status)
  }
}
