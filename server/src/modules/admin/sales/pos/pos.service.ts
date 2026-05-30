import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { OrderSource } from '@/common/enums/order-source.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { ArService } from '@/modules/admin/operations/finance/accounting/services/ar.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { ProductBatchService } from '@/modules/admin/operations/logistics/inventory-transaction/product-batch.service'
import { CouponEntity } from '@/modules/admin/sales/coupon/entities/coupon.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ClosePosShiftDto } from './dtos/close-pos-shift.dto'
import { CreateDrawerTransactionDto } from './dtos/create-drawer-transaction.dto'
import { CreatePosRegisterDto } from './dtos/create-pos-register.dto'
import { OpenPosShiftDto } from './dtos/open-pos-shift.dto'
import { SyncPosSaleDto } from './dtos/sync-pos-sale.dto'
import {
  PosDrawerTransactionEntity,
  PosDrawerTransactionType,
} from './entities/pos-drawer-transaction.entity'
import { PosRegisterEntity } from './entities/pos-register.entity'
import { PosShiftEntity, PosShiftStatus } from './entities/pos-shift.entity'
import { PosDrawerTransactionRepository } from './repositories/pos-drawer-transaction.repository'
import { PosRegisterRepository } from './repositories/pos-register.repository'
import { PosShiftRepository } from './repositories/pos-shift.repository'

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name)

  constructor(
    private readonly registerRepository: PosRegisterRepository,
    private readonly shiftRepository: PosShiftRepository,
    private readonly drawerTransactionRepository: PosDrawerTransactionRepository,
    private readonly inventoryService: InventoryLedgerService,
    private readonly accountingService: AccountingService,
    private readonly arService: ArService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
    private readonly batchService: ProductBatchService,
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

  async updateRegister(id: string, data: any, ctx: RequestContextDto): Promise<PosRegisterEntity> {
    this.logger.log(`${this.updateRegister.name} Service Called`)
    const register = await this.findOneRegister(id, ctx)
    return this.registerRepository.update(register, data)
  }

  async deleteRegister(id: string, ctx: RequestContextDto): Promise<void> {
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
    const cashIn = Number(shift.cashIn || 0)
    const cashOut = Number(shift.cashOut || 0)
    const expectedClosingBalance = openingBalance + cashSales + cashIn - cashOut
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
  ): Promise<{ success: boolean; message: string; data?: { orderId: string } }> {
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
    let savedOrderId = ''
    await this.dataSource.transaction(async (manager) => {
      // 1. Idempotency Check using offlineSaleId
      if (dto.offlineSaleId) {
        const orderRepo = manager.getRepository(OrderEntity)
        const existingOrder = await orderRepo.findOne({
          where: { offlineSaleId: dto.offlineSaleId, tenantId },
        })
        if (existingOrder) {
          // Transaction already processed, return success immediately
          savedOrderId = existingOrder.id
          return
        }
      }

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
        paymentMethod: dto.paymentMethod as unknown as PaymentMethod,
        paymentStatus:
          dto.paymentMethod === PaymentMethod.ON_ACCOUNT
            ? PaymentStatus.PENDING
            : PaymentStatus.PAID,
        tenantId,
        userId: dto.customerId || undefined,
        appliedCoupon: dto.appliedCoupon || undefined,
        couponDiscountAmount: dto.couponDiscountAmount || 0,
        offlineSaleId: dto.offlineSaleId || null,
        payments: null,
      })

      if (dto.createdAt) {
        order.createdAt = new Date(dto.createdAt)
      }

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
        const itemTax = (itemTotal * taxRate) / 100
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

        // Deduct inventory stock directly through the Ledger Service using FEFO allocation
        let allocations: { batchId: string; quantity: number }[] = []
        try {
          allocations = await this.batchService.allocateFEFOStock(
            tenantId,
            item.productId,
            item.variantId || null,
            Number(item.quantity),
            manager,
          )
        } catch (batchErr: any) {
          this.logger.warn(
            `FEFO Batch allocation failed for POS sale item ${item.productId}: ${batchErr.message}. Falling back to default inventory deduction.`,
          )
        }

        if (allocations.length > 0) {
          for (const alloc of allocations) {
            await this.inventoryService.createLedgerEntry(
              {
                productId: item.productId,
                variantId: item.variantId || undefined,
                quantity: Number(alloc.quantity),
                type: InventoryTransactionType.SALE,
                referenceType: 'ORDER' as any,
                referenceId: savedOrder.id,
                warehouseId: (ctx.user as any)?.warehouseId || undefined,
                branchId: shift.register?.branchId || undefined,
                batchId: alloc.batchId,
                remarks: `POS Sale (Batch Allocated) - Order ID: ${savedOrder.id}`,
                createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
              } as any,
              ctx,
              manager,
            )
          }
        } else {
          // Fallback to simple inventory deduction if no active batches are configured
          await this.inventoryService.createLedgerEntry(
            {
              productId: item.productId,
              variantId: item.variantId || undefined,
              quantity: Number(item.quantity),
              type: InventoryTransactionType.SALE,
              referenceType: 'ORDER' as any,
              referenceId: savedOrder.id,
              warehouseId: (ctx.user as any)?.warehouseId || undefined,
              branchId: shift.register?.branchId || undefined,
              remarks: `POS Sale - Order ID: ${savedOrder.id}`,
              createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
            } as any,
            ctx,
            manager,
          )
        }
      }

      // Calculate net amounts accounting for coupon discount and shipping fees
      const discount = Number(dto.couponDiscountAmount || 0)
      const shipping = Number(dto.shippingFee || 0)

      const discountFactor = totalSaleAmount > 0 ? Math.max(0, 1 - discount / totalSaleAmount) : 1
      const finalTaxAmount = totalTaxAmount * discountFactor
      const netSaleAmount = Math.max(0, totalSaleAmount - discount) + finalTaxAmount + shipping

      // Update Order total sum
      savedOrder.totalAmount = netSaleAmount
      savedOrder.taxAmount = finalTaxAmount

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

      const remainingAmount = netSaleAmount - walletDeductionAmount

      // Build and validate payment breakdown
      let paymentBreakdown = dto.payments
      if (!paymentBreakdown || paymentBreakdown.length === 0) {
        paymentBreakdown = [
          {
            method: dto.paymentMethod,
            amount: remainingAmount,
          },
        ]
      } else {
        const paymentsTotal = paymentBreakdown.reduce((sum, p) => sum + Number(p.amount), 0)
        if (Math.abs(paymentsTotal - remainingAmount) > 0.01) {
          throw new BadRequestException(
            `Total payments amount (${paymentsTotal}) does not match remaining order net amount (${remainingAmount})`,
          )
        }
      }

      savedOrder.payments = paymentBreakdown as any

      if (dto.createdAt) {
        savedOrder.createdAt = new Date(dto.createdAt)
      }
      await orderRepo.save(savedOrder)
      savedOrderId = savedOrder.id

      // Verify B2B Credit Limits & Post AR Ledger if ON_ACCOUNT
      const onAccountAmount = paymentBreakdown
        .filter((p) => p.method === PaymentMethod.ON_ACCOUNT)
        .reduce((sum, p) => sum + Number(p.amount), 0)

      if (onAccountAmount > 0) {
        if (!customer) {
          throw new BadRequestException(
            'Customer user profile is required for credit/on-account checkout',
          )
        }
        if (customer.creditHold) {
          throw new BadRequestException('Checkout blocked: Customer account is on credit hold')
        }
        const currentOutstanding = await this.arService.getCustomerOutstandingBalance(
          customer.id,
          tenantId,
          manager,
        )
        const limit = Number(customer.creditLimit || 0)
        if (currentOutstanding + onAccountAmount > limit) {
          throw new BadRequestException(
            `Checkout blocked: POS sale remaining total ($${onAccountAmount}) exceeds customer credit limit ($${limit}) with current debt ($${currentOutstanding})`,
          )
        }

        const dueDate = new Date(dto.createdAt || new Date())
        dueDate.setDate(dueDate.getDate() + 30) // Net 30 Terms

        await this.arService.postArTransaction(
          {
            customerId: customer.id,
            type: ArTransactionType.INVOICE,
            amount: onAccountAmount,
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
      let newCashSales = Number(shift.cashSales || 0)
      let newCardSales = Number(shift.cardSales || 0)
      let newMobileSales = Number(shift.mobileSales || 0)

      for (const p of paymentBreakdown) {
        if (p.method === PaymentMethod.CASH) {
          newCashSales += Number(p.amount)
        } else if (p.method === PaymentMethod.CARD) {
          newCardSales += Number(p.amount)
        } else if (p.method === PaymentMethod.MOBILE) {
          newMobileSales += Number(p.amount)
        }
      }

      updatedFields.cashSales = newCashSales
      updatedFields.cardSales = newCardSales
      updatedFields.mobileSales = newMobileSales
      updatedFields.expectedClosingBalance =
        Number(shift.openingBalance || 0) +
        Number(newCashSales) +
        Number(shift.cashIn || 0) -
        Number(shift.cashOut || 0)

      await this.shiftRepository.update(shift, updatedFields, manager)

      // C. Post general ledger financial entry for Sales Revenue (Debit Cash/AR & Credit Revenue)
      const taxAmount = Number(savedOrder.taxAmount || 0)
      const netRevenue = netSaleAmount - taxAmount

      const linesMap = new Map<
        string,
        { accountCode: string; side: LedgerEntrySide; amount: number }
      >()
      const addLine = (accountCode: string, side: LedgerEntrySide, amount: number) => {
        const key = `${accountCode}_${side}`
        if (linesMap.has(key)) {
          linesMap.get(key).amount += amount
        } else {
          linesMap.set(key, { accountCode, side, amount })
        }
      }

      if (walletDeductionAmount > 0) {
        addLine('2300', LedgerEntrySide.DEBIT, walletDeductionAmount)
      }

      for (const p of paymentBreakdown) {
        if (p.amount > 0) {
          const debitAccount = p.method === PaymentMethod.ON_ACCOUNT ? '1200' : '1000'
          addLine(debitAccount, LedgerEntrySide.DEBIT, Number(p.amount))
        }
      }

      if (netRevenue > 0) {
        addLine('4000', LedgerEntrySide.CREDIT, netRevenue)
      }
      if (taxAmount > 0) {
        addLine('2200', LedgerEntrySide.CREDIT, taxAmount)
      }

      const lines = Array.from(linesMap.values())

      await this.accountingService.createJournalEntry(
        {
          type: JournalType.SALES,
          description: `POS Sale Synced - Order ID: ${savedOrder.id} - Payments: ${JSON.stringify(paymentBreakdown)}${dto.appliedCoupon ? ` - Coupon Applied: ${dto.appliedCoupon}` : ''}`,
          referenceType: 'POS_SHIFT',
          referenceId: shift.id,
          lines,
          date: dto.createdAt ? new Date(dto.createdAt) : undefined,
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
      data: {
        orderId: savedOrderId,
      },
    }
  }

  async getShifts(ctx: RequestContextDto): Promise<PosShiftEntity[]> {
    this.logger.log(`${this.getShifts.name} Service Called`)
    return this.shiftRepository.findAll(ctx.tenantId)
  }

  // =========================================================================
  // CASH DRAWER TRACKING METHODS
  // =========================================================================

  async createDrawerTransaction(
    shiftId: string,
    dto: CreateDrawerTransactionDto,
    ctx: RequestContextDto,
  ): Promise<PosDrawerTransactionEntity> {
    this.logger.log(`${this.createDrawerTransaction.name} Service Called`)
    const tenantId = ctx.tenantId

    const shift = await this.shiftRepository.findOne(shiftId, tenantId)
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found`)
    }

    if (shift.status === PosShiftStatus.CLOSED) {
      throw new BadRequestException('Cannot perform drawer transactions on a closed cashier shift.')
    }

    return this.dataSource.transaction(async (manager) => {
      const tx = await this.drawerTransactionRepository.create(
        {
          shiftId,
          type: dto.type,
          amount: Number(dto.amount),
          reason: dto.reason || null,
          userId: ctx.userId || null,
        },
        ctx,
        manager,
      )

      // Update cashier shift expected closing balance
      const updatedFields: Partial<PosShiftEntity> = {}
      if (dto.type === PosDrawerTransactionType.CASH_IN) {
        updatedFields.cashIn = Number(shift.cashIn || 0) + Number(dto.amount)
      } else {
        updatedFields.cashOut = Number(shift.cashOut || 0) + Number(dto.amount)
      }

      updatedFields.expectedClosingBalance =
        Number(shift.openingBalance || 0) +
        Number(shift.cashSales || 0) +
        Number(updatedFields.cashIn ?? shift.cashIn ?? 0) -
        Number(updatedFields.cashOut ?? shift.cashOut ?? 0)

      await this.shiftRepository.update(shift, updatedFields, manager)

      return tx
    })
  }

  async getDrawerTransactionsForShift(
    shiftId: string,
    ctx: RequestContextDto,
  ): Promise<PosDrawerTransactionEntity[]> {
    this.logger.log(`${this.getDrawerTransactionsForShift.name} Service Called`)
    return this.drawerTransactionRepository.findAllForShift(shiftId, ctx.tenantId)
  }
}
