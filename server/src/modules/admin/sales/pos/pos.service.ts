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
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { OrderSource } from '@/common/enums/order-source.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { CouponEntity } from '@/modules/admin/sales/coupon/entities/coupon.entity'

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
      // Resolve Customer profile if provided
      let customerName = 'Walk-in Customer'
      let customerEmail = 'guest@store.com'
      let customerPhone = 'N/A'
      let customerAddress = 'POS Terminal Counter'

      if (dto.customerId) {
        const customer = await manager.findOne(UserEntity, { where: { id: dto.customerId, tenantId } })
        if (customer) {
          customerName = customer.name || customerName
          customerEmail = customer.email || customerEmail
          customerPhone = customer.phone || customerPhone
          customerAddress = (customer as any).address || customerAddress
        }
      }

      // Create the POS Order record
      const orderRepo = manager.getRepository(OrderEntity)
      const orderItemRepo = manager.getRepository(OrderItemEntity)

      const order = orderRepo.create({
        customerName,
        customerEmail,
        customerPhone,
        address: dto.shippingAddress || customerAddress, // Use custom shipping address if supplied!
        totalAmount: 0, // Summed dynamically below
        shippingFee: dto.shippingFee || 0,
        deliveryZone: dto.deliveryZone || undefined,
        currency: 'USD',
        currencyRate: 1,
        status: OrderStatus.COMPLETED, // POS sales are immediately fulfilled
        orderSource: OrderSource.POS, // Explicit order type categorization!
        paymentMethod: dto.paymentMethod.toLowerCase() as unknown as PaymentMethod,
        paymentStatus: PaymentStatus.PAID, // Cash collected on the counter
        tenantId,
        userId: dto.customerId || undefined,
        appliedCoupon: dto.appliedCoupon || undefined,
        couponDiscountAmount: dto.couponDiscountAmount || 0,
      })

      const savedOrder = await orderRepo.save(order)
      let totalSaleAmount = 0

      // A. Process each sold item
      for (const item of dto.items) {
        const itemTotal = Number(item.price) * Number(item.quantity)
        totalSaleAmount += itemTotal

        // Create Order Item record
        const orderItem = orderItemRepo.create({
          orderId: savedOrder.id,
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.price),
          totalAmount: itemTotal,
          tenantId,
        })
        await orderItemRepo.save(orderItem)

        // Deduct inventory stock directly through the Ledger Service
        await this.inventoryService.createLedgerEntry(
          {
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: Number(item.quantity), // Passed as positive; Ledger Service automatically handles negation for SALE
            type: InventoryTransactionType.SALE,
            referenceType: 'ORDER' as any, // POS orders are categorized under ORDER reference
            referenceId: savedOrder.id, // Linked to the brand new Sales Order
            warehouseId: (ctx.user as any)?.warehouseId || undefined, // Scope to cashier's warehouse
            branchId: shift.register?.branchId || undefined,
            remarks: `POS Sale - Order ID: ${savedOrder.id}`,
          },
          ctx,
          manager,
        )
      }

      // Calculate net amounts accounting for coupon discount and shipping fees
      const discount = Number(dto.couponDiscountAmount || 0)
      const shipping = Number(dto.shippingFee || 0)
      const netSaleAmount = Math.max(0, totalSaleAmount - discount) + shipping

      // Update Order total sum
      savedOrder.totalAmount = netSaleAmount
      await orderRepo.save(savedOrder)

      // B. Update Cashier shift sales aggregates using net collected amount
      const updatedFields: Partial<PosShiftEntity> = {}
      if (dto.paymentMethod === PosPaymentMethod.CASH) {
        updatedFields.cashSales = Number(shift.cashSales || 0) + netSaleAmount
      } else if (dto.paymentMethod === PosPaymentMethod.CARD) {
        updatedFields.cardSales = Number(shift.cardSales || 0) + netSaleAmount
      } else if (dto.paymentMethod === PosPaymentMethod.MOBILE) {
        updatedFields.mobileSales = Number(shift.mobileSales || 0) + netSaleAmount
      }

      updatedFields.expectedClosingBalance =
        Number(shift.openingBalance || 0) + Number(updatedFields.cashSales || shift.cashSales || 0)

      await this.shiftRepository.update(shift, updatedFields, manager)

      // C. Post general ledger financial entry for Sales Revenue (actual net collected cash)
      await this.accountingService.createJournalEntry(
        {
          type: JournalType.SALES,
          description: `POS Sale Synced - Order ID: ${savedOrder.id} - Payment Method: ${dto.paymentMethod}${dto.appliedCoupon ? ` - Coupon Applied: ${dto.appliedCoupon}` : ''}`,
          referenceType: 'POS_SHIFT',
          referenceId: shift.id,
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount: netSaleAmount }, // Debit Cash
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: netSaleAmount }, // Credit Sales Revenue
          ],
        },
        ctx,
        manager,
      )

      // D. Increment coupon usage counter if valid
      if (dto.appliedCoupon) {
        const couponRepo = manager.getRepository(CouponEntity)
        const coupon = await couponRepo.findOne({
          where: { code: dto.appliedCoupon.toUpperCase().trim(), tenantId }
        })
        if (coupon) {
          coupon.usedCount = Number(coupon.usedCount || 0) + 1
          await couponRepo.save(coupon)
        }
      }
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
