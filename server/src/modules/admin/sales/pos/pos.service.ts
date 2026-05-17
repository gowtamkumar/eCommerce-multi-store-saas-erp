import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PosRegisterRepository } from './repositories/pos-register.repository'
import { PosShiftRepository } from './repositories/pos-shift.repository'
import { PosRegisterEntity } from './entities/pos-register.entity'
import { PosShiftEntity, PosShiftStatus } from './entities/pos-shift.entity'
import { CreatePosRegisterDto } from './dtos/create-pos-register.dto'
import { OpenPosShiftDto } from './dtos/open-pos-shift.dto'
import { ClosePosShiftDto } from './dtos/close-pos-shift.dto'
import { SyncPosSaleDto, PosPaymentMethod } from './dtos/sync-pos-sale.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name)

  constructor(
    private readonly registerRepository: PosRegisterRepository,
    private readonly shiftRepository: PosShiftRepository,
    private readonly inventoryService: InventoryLedgerService,
    private readonly accountingService: AccountingService,
    private readonly dataSource: DataSource,
  ) {}

  // =========================================================================
  // REGISTER TERMINAL METHODS
  // =========================================================================

  async createRegister(
    dto: CreatePosRegisterDto,
    ctx: RequestContextDto,
  ): Promise<PosRegisterEntity> {
    this.logger.log(`${this.createRegister.name} Service Called`)
    return this.registerRepository.create(dto, ctx)
  }

  async findAllRegisters(ctx: RequestContextDto): Promise<PosRegisterEntity[]> {
    this.logger.log(`${this.findAllRegisters.name} Service Called`)
    return this.registerRepository.findAll(ctx.tenantId)
  }

  async findOneRegister(id: string, ctx: RequestContextDto): Promise<PosRegisterEntity> {
    this.logger.log(`${this.findOneRegister.name} Service Called`)
    const register = await this.registerRepository.findOne(id, ctx.tenantId)
    if (!register) {
      throw new NotFoundException(`POS Register terminal with ID ${id} not found`)
    }
    return register
  }

  // =========================================================================
  // CASHIER SHIFT METHODS
  // =========================================================================

  async openShift(dto: OpenPosShiftDto, ctx: RequestContextDto): Promise<PosShiftEntity> {
    this.logger.log(`${this.openShift.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId

    if (!userId) {
      throw new BadRequestException('Cashier identity required to open shift')
    }

    // 1. Verify Register exists
    await this.findOneRegister(dto.registerId, ctx)

    // 2. Check if cashier already has an active open shift
    const activeShift = await this.shiftRepository.findActiveShiftForUser(userId, tenantId)
    if (activeShift) {
      throw new BadRequestException(
        `You already have an active open shift on terminal: ${activeShift.register?.name || 'Unknown'}. Please close it first.`,
      )
    }

    // 3. Open new shift session
    return this.shiftRepository.create(
      {
        registerId: dto.registerId,
        userId,
        status: PosShiftStatus.OPEN,
        openingBalance: Number(dto.openingBalance),
        expectedClosingBalance: Number(dto.openingBalance),
      },
      ctx,
    )
  }

  async findActiveShift(ctx: RequestContextDto): Promise<PosShiftEntity> {
    this.logger.log(`${this.findActiveShift.name} Service Called`)
    const userId = ctx.userId
    const tenantId = ctx.tenantId

    if (!userId) {
      throw new BadRequestException('Cashier identity required')
    }

    const shift = await this.shiftRepository.findActiveShiftForUser(userId, tenantId)
    if (!shift) {
      throw new NotFoundException('No active open shift found for the logged-in cashier')
    }
    return shift
  }

  async closeShift(
    id: string,
    dto: ClosePosShiftDto,
    ctx: RequestContextDto,
  ): Promise<PosShiftEntity> {
    this.logger.log(`${this.closeShift.name} Service Called`)
    const tenantId = ctx.tenantId

    const shift = await this.shiftRepository.findOne(id, tenantId)
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`)
    }

    if (shift.status === PosShiftStatus.CLOSED) {
      throw new BadRequestException('This shift has already been closed and audited.')
    }

    const cashSales = Number(shift.cashSales || 0)
    const openingBalance = Number(shift.openingBalance || 0)
    const expectedClosingBalance = openingBalance + cashSales
    const closingBalance = Number(dto.closingBalance)
    const difference = closingBalance - expectedClosingBalance

    return this.shiftRepository.update(shift, {
      status: PosShiftStatus.CLOSED,
      closingTime: new Date(),
      closingBalance,
      expectedClosingBalance,
      difference,
      remarks: dto.remarks || null,
    })
  }

  // =========================================================================
  // HIGH-SPEED OFFLINE SYNC PROCESSING
  // =========================================================================

  async syncPosSale(
    dto: SyncPosSaleDto,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.syncPosSale.name} Service Called`)
    const tenantId = ctx.tenantId

    // 1. Verify shift session is still open
    const shift = await this.shiftRepository.findOne(dto.shiftId, tenantId)
    if (!shift) {
      throw new NotFoundException(`POS Shift session with ID ${dto.shiftId} not found`)
    }

    if (shift.status === PosShiftStatus.CLOSED) {
      throw new BadRequestException('Cannot sync sales to a closed and audited cashier shift.')
    }

    // 2. Process transactions within a database runner to ensure transactional atomicity
    await this.dataSource.transaction(async (manager) => {
      let totalSaleAmount = 0

      // A. Process each sold item
      for (const item of dto.items) {
        const itemTotal = Number(item.price) * Number(item.quantity)
        totalSaleAmount += itemTotal

        // Deduct inventory stock directly through the Ledger Service
        await this.inventoryService.createLedgerEntry(
          {
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: Number(item.quantity), // Passed as positive; Ledger Service automatically handles negation for SALE
            type: InventoryTransactionType.SALE,
            referenceType: 'ORDER' as any, // POS orders are categorized under ORDER reference
            referenceId: shift.id,
            warehouseId: (ctx.user as any)?.warehouseId || undefined, // Scope to cashier's warehouse
            branchId: shift.register?.branchId || undefined,
            remarks: `POS Sale from Shift ID: ${shift.id}`,
          },
          ctx,
          manager,
        )
      }

      // B. Update Cashier shift sales aggregates
      const updatedFields: Partial<PosShiftEntity> = {}
      if (dto.paymentMethod === PosPaymentMethod.CASH) {
        updatedFields.cashSales = Number(shift.cashSales || 0) + totalSaleAmount
      } else if (dto.paymentMethod === PosPaymentMethod.CARD) {
        updatedFields.cardSales = Number(shift.cardSales || 0) + totalSaleAmount
      } else if (dto.paymentMethod === PosPaymentMethod.MOBILE) {
        updatedFields.mobileSales = Number(shift.mobileSales || 0) + totalSaleAmount
      }

      updatedFields.expectedClosingBalance =
        Number(shift.openingBalance || 0) + Number(updatedFields.cashSales || shift.cashSales || 0)

      await this.shiftRepository.update(shift, updatedFields, manager)

      // C. Post general ledger financial entry for Sales Revenue
      await this.accountingService.createJournalEntry(
        {
          type: JournalType.SALES,
          description: `POS Sale Synced - Payment Method: ${dto.paymentMethod}`,
          referenceType: 'POS_SHIFT',
          referenceId: shift.id,
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: totalSaleAmount }, // Debit Cash
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: totalSaleAmount }, // Credit Sales Revenue
          ],
        },
        ctx,
        manager,
      )
    })

    return {
      success: true,
      message: 'POS offline sale transaction processed and synced successfully',
    }
  }

  async getShifts(ctx: RequestContextDto): Promise<PosShiftEntity[]> {
    this.logger.log(`${this.getShifts.name} Service Called`)
    return this.shiftRepository.findAll(ctx.tenantId)
  }
}
