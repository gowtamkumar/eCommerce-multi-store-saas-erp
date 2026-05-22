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
import { ArService } from '@/modules/admin/operations/finance/accounting/services/ar.service'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name)

  constructor(
    private readonly registerRepository: PosRegisterRepository,
    private readonly shiftRepository: PosShiftRepository,
    private readonly inventoryService: InventoryLedgerService,
    private readonly accountingService: AccountingService,
    private readonly arService: ArService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) { }

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

  async updateRegister(
    id: string,
    data: any,
    ctx: RequestContextDto,
  ): Promise<PosRegisterEntity> {
    this.logger.log(`${this.updateRegister.name} Service Called`)
    const register = await this.findOneRegister(id, ctx)
    return this.registerRepository.update(register, data)
  }

  async deleteRegister(
    id: string,
    ctx: RequestContextDto,
  ): Promise<void> {
    this.logger.log(`${this.deleteRegister.name} Service Called`)
    const register = await this.findOneRegister(id, ctx)
    return this.registerRepository.remove(register)
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

      let customer: UserEntity = null
      if (dto.customerId) {
        customer = await manager.findOne(UserEntity, {
          where: { id: dto.customerId, tenantId },
        })
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
        paymentStatus: dto.paymentMethod === PosPaymentMethod.ON_ACCOUNT ? PaymentStatus.PENDING : PaymentStatus.PAID,
        tenantId,
        userId: dto.customerId || undefined,
        appliedCoupon: dto.appliedCoupon || undefined,
        couponDiscountAmount: dto.couponDiscountAmount || 0,
      })

      const savedOrder = await orderRepo.save(order)
      let totalSaleAmount = 0
      let totalTaxAmount = 0

      // A. Process each sold item
      for (const item of dto.items) {
        const itemTotal = Number(item.price) * Number(item.quantity)
        totalSaleAmount += itemTotal

        const product = await manager.findOne(ProductEntity, {
          where: { id: item.productId, tenantId },
        })
        const taxRate = product ? Number(product.taxRate || 0) : 0
        const itemTax = taxRate > 0 ? itemTotal - (itemTotal / (1 + taxRate / 100)) : 0
        totalTaxAmount += itemTax

        // Create Order Item record
        const orderItem = orderItemRepo.create({
          orderId: savedOrder.id,
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.price),
          totalAmount: itemTotal,
          taxAmount: itemTax,
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
      const discountFactor = totalSaleAmount > 0 ? Math.max(0, 1 - discount / totalSaleAmount) : 1
      savedOrder.taxAmount = totalTaxAmount * discountFactor

      // Wallet Balance Deduction (within same transaction, before GL posting)
      let walletDeductionAmount = 0
      if (dto.useWalletBalance && dto.customerId && customer) {
        const availableBalance = await this.walletService.getAvailableBalance(
          dto.customerId,
          tenantId,
          manager,
        )
        if (availableBalance > 0) {
          const deductAmount = dto.walletAmountToUse
            ? Math.min(Number(dto.walletAmountToUse), availableBalance, netSaleAmount)
            : Math.min(availableBalance, netSaleAmount)

          if (deductAmount > 0) {
            await this.walletService.debitWallet(
              {
                customerId: dto.customerId,
                amount: deductAmount,
                referenceType: 'POS_SALE',
                referenceId: savedOrder.id,
                note: `POS wallet payment — Order #${savedOrder.id.substring(0, 8)}`,
                skipGlPost: true,
              },
              ctx,
              manager,
            )
            walletDeductionAmount = deductAmount
            savedOrder.walletDeductionAmount = deductAmount
          }
        }
      }

      await orderRepo.save(savedOrder)

      // Verify B2B Credit Limits & Post AR Ledger if ON_ACCOUNT
      const remainingAmount = netSaleAmount - walletDeductionAmount
      if (dto.paymentMethod === PosPaymentMethod.ON_ACCOUNT) {
        if (!customer) {
          throw new BadRequestException('Customer user profile is required for credit/on-account checkout')
        }
        if (customer.creditHold) {
          throw new BadRequestException('Checkout blocked: Customer account is on credit hold')
        }
        const currentOutstanding = await this.arService.getCustomerOutstandingBalance(customer.id, tenantId, manager)
        const limit = Number(customer.creditLimit || 0)
        if (currentOutstanding + remainingAmount > limit) {
          throw new BadRequestException(
            `Checkout blocked: POS sale remaining total ($${remainingAmount}) exceeds customer credit limit ($${limit}) with current debt ($${currentOutstanding})`
          )
        }

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30) // Net 30 Terms

        await this.arService.postArTransaction(
          {
            customerId: customer.id,
            type: ArTransactionType.INVOICE,
            amount: remainingAmount,
            referenceType: 'ORDER',
            referenceId: savedOrder.id,
            dueDate,
            currency: 'USD',
          },
          ctx,
          manager,
        )
      }

      // B. Update Cashier shift sales aggregates using net collected amount
      const updatedFields: Partial<PosShiftEntity> = {}
      if (dto.paymentMethod === PosPaymentMethod.CASH) {
        updatedFields.cashSales = Number(shift.cashSales || 0) + remainingAmount
      } else if (dto.paymentMethod === PosPaymentMethod.CARD) {
        updatedFields.cardSales = Number(shift.cardSales || 0) + remainingAmount
      } else if (dto.paymentMethod === PosPaymentMethod.MOBILE) {
        updatedFields.mobileSales = Number(shift.mobileSales || 0) + remainingAmount
      }

      updatedFields.expectedClosingBalance =
        Number(shift.openingBalance || 0) + Number(updatedFields.cashSales || shift.cashSales || 0)

      await this.shiftRepository.update(shift, updatedFields, manager)

      // C. Post general ledger financial entry for Sales Revenue (Debit Cash/AR & Credit Revenue)
      const taxAmount = Number(savedOrder.taxAmount || 0)
      const netRevenue = netSaleAmount - taxAmount

      const lines = []
      if (walletDeductionAmount > 0) {
        lines.push({ accountCode: '2300', side: LedgerEntrySide.DEBIT, amount: walletDeductionAmount })
      }
      if (remainingAmount > 0) {
        const debitAccount = dto.paymentMethod === PosPaymentMethod.ON_ACCOUNT ? '1200' : '1000'
        lines.push({ accountCode: debitAccount, side: LedgerEntrySide.DEBIT, amount: remainingAmount })
      }
      if (netRevenue > 0) {
        lines.push({ accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: netRevenue })
      }
      if (taxAmount > 0) {
        lines.push({ accountCode: '2200', side: LedgerEntrySide.CREDIT, amount: taxAmount })
      }

      await this.accountingService.createJournalEntry(
        {
          type: JournalType.SALES,
          description: `POS Sale Synced - Order ID: ${savedOrder.id} - Payment Method: ${dto.paymentMethod}${dto.appliedCoupon ? ` - Coupon Applied: ${dto.appliedCoupon}` : ''}`,
          referenceType: 'POS_SHIFT',
          referenceId: shift.id,
          lines,
        },
        ctx,
        manager,
      )

      // D. Increment coupon usage counter if valid
      if (dto.appliedCoupon) {
        const couponRepo = manager.getRepository(CouponEntity)
        const coupon = await couponRepo.findOne({
          where: { code: dto.appliedCoupon.toUpperCase().trim(), tenantId },
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
