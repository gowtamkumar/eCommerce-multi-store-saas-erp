import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { GrnRepository } from './grn.repository'
import { CreateGrnDto, VerifyGrnDto } from './dto/grn.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { GoodsReceivedNoteEntity } from './entities/grn.entity'
import { GrnStatus } from '@/common/enums/grn-status.enum'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { SupplierAPLedgerRepository } from '@/modules/admin/operations/finance/supplier/supplier-ap-ledger.repository'
import { SupplierAPReferenceType } from '../../finance/supplier/enums/supplier-ap-Refernce-type.enum'

@Injectable()
export class GrnService {
  private readonly logger = new Logger(GrnService.name)

  constructor(
    private readonly repository: GrnRepository,
    private readonly dataSource: DataSource,
    @InjectQueue('product') private readonly productQueue: Queue,
    private readonly apLedgerRepository: SupplierAPLedgerRepository,
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
      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

      try {
        grn.status = GrnStatus.RECEIVED
        grn.notes = dto.notes || grn.notes
        const savedGrn = await this.repository.save(grn, queryRunner.manager)

        let totalGrnCost = 0

        // 1. Dispatch Stock Movements
        for (const item of grn.items) {
          totalGrnCost += item.receivedQty * item.unitCost

          if (item.receivedQty > 0) {
            await this.productQueue.add('update-stock', {
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.receivedQty,
              type: InventoryTransactionType.PURCHASE,
              referenceType: InventoryTransactionReferenceType.GOODS_RECEIVED_NOTE,
              referenceId: grn.id,
              supplierId: grn.supplierId,
              tenantId: ctx.tenantId,
              unitCost: item.unitCost, // Passing unit cost for FIFO tracking
            })
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
              credit: totalGrnCost, // Increase AP balance
              remarks: `GRN Verification: ${grn.grnNumber}`,
            },
            queryRunner.manager,
          )
        }

        await queryRunner.commitTransaction()
        return savedGrn
      } catch (err) {
        this.logger.error('Failed to verify GRN', err.stack)
        await queryRunner.rollbackTransaction()
        throw err
      } finally {
        await queryRunner.release()
      }
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
