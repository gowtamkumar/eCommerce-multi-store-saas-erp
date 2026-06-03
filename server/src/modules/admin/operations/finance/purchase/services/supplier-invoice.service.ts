import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { SupplierInvoiceRepository } from '../repositories/supplier-invoice.repository'
import {
  SupplierInvoiceEntity,
  SupplierInvoiceStatus,
  ThreeWayMatchStatus,
} from '../entities/supplier-invoice.entity'
import {
  CreateSupplierInvoiceDto,
  UpdateSupplierInvoiceStatusDto,
} from '../dto/supplier-invoice.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository'
import { GoodsReceivedNoteEntity } from '@/modules/admin/operations/logistics/grn/entities/grn.entity'
import { GrnStatus } from '@/common/enums/grn-status.enum'
import { SupplierPaymentRepository } from '../repositories/supplier-payment.repository'
import { SupplierAPLedgerEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier-ap-ledger.entity'
import { SupplierAPReferenceType } from '@/modules/admin/operations/finance/supplier/enums/supplier-ap-Refernce-type.enum'
import { LedgerEntrySide, JournalType } from '@/common/enums/journal-type.enum'
import { RecordSupplierPaymentDto } from '../dto/record-payment.dto'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class SupplierInvoiceService {
  private readonly logger = new Logger(SupplierInvoiceService.name)

  constructor(
    private readonly repository: SupplierInvoiceRepository,
    private readonly poRepository: PurchaseOrderRepository,
    private readonly paymentRepository: SupplierPaymentRepository,
    @InjectQueue('accounting') private readonly accountingQueue: Queue,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async createInvoice(
    dto: CreateSupplierInvoiceDto,
    ctx: RequestContextDto,
  ): Promise<SupplierInvoiceEntity> {
    this.logger.log('Creating Supplier Invoice and performing 3-way matching')
    const tenantId = ctx.tenantId

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * Number(item.unitPrice),
      0,
    )

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Create the Invoice Entity
      const invoice = queryRunner.manager.create(SupplierInvoiceEntity, {
        invoiceNumber: dto.invoiceNumber,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId,
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: new Date(dto.dueDate),
        totalAmount,
        paidAmount: 0,
        status: SupplierInvoiceStatus.PENDING_MATCH,
        matchStatus: ThreeWayMatchStatus.PENDING,
        tenantId,
        createdById: ctx.userId,
        items: dto.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          tenantId,
        })),
      })

      const savedInvoice = await queryRunner.manager.save(SupplierInvoiceEntity, invoice)

      // 2. Perform 3-Way Matching Engine
      const po = await this.poRepository.findByIdWithRelations(
        dto.purchaseOrderId,
        tenantId,
        queryRunner.manager,
      )
      if (!po) {
        throw new NotFoundException('Associated Purchase Order not found')
      }

      const grns = await queryRunner.manager.find(GoodsReceivedNoteEntity, {
        where: { poId: po.id, tenantId, status: GrnStatus.RECEIVED },
        relations: ['items'],
      })

      const receivedQtyMap = new Map<string, number>()
      for (const grn of grns) {
        for (const item of grn.items) {
          const current = receivedQtyMap.get(item.productId) || 0
          receivedQtyMap.set(item.productId, current + Number(item.receivedQty))
        }
      }

      const discrepancies: string[] = []

      for (const item of dto.items) {
        const poItem = po.items?.find((pi) => pi.productId === item.productId)
        const receivedQty = receivedQtyMap.get(item.productId) || 0

        if (!poItem) {
          discrepancies.push(
            `Product ID ${item.productId} is not part of Purchase Order ${po.referenceNumber}`,
          )
          continue
        }

        // Compare prices
        if (Number(item.unitPrice) !== Number(poItem.unitPrice)) {
          discrepancies.push(
            `Price mismatch for product ${item.productId}: Invoiced Unit Price is $${item.unitPrice}, PO Unit Price is $${poItem.unitPrice}`,
          )
        }

        // Compare quantities against PO
        if (item.quantity > poItem.quantity) {
          discrepancies.push(
            `Quantity mismatch for product ${item.productId}: Invoiced Quantity ${item.quantity} exceeds PO Quantity ${poItem.quantity}`,
          )
        }

        // Compare quantities against GRN
        if (item.quantity > receivedQty) {
          discrepancies.push(
            `Intake mismatch for product ${item.productId}: Invoiced Quantity ${item.quantity} exceeds Goods Received (GRN) Quantity ${receivedQty}`,
          )
        }
      }

      if (discrepancies.length > 0) {
        savedInvoice.matchStatus = ThreeWayMatchStatus.DISCREPANCY
        savedInvoice.status = SupplierInvoiceStatus.DISCREPANCY
        savedInvoice.discrepancyNotes = discrepancies.join('\n')
      } else {
        savedInvoice.matchStatus = ThreeWayMatchStatus.MATCHED
        savedInvoice.status = SupplierInvoiceStatus.MATCHED
      }

      const finalInvoice = await queryRunner.manager.save(SupplierInvoiceEntity, savedInvoice)

      await queryRunner.commitTransaction()

      await this.cacheService.delCacheByPattern(`si:list*`, tenantId)
      return finalInvoice
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAllInvoices(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: SupplierInvoiceStatus,
  ): Promise<{
    items: SupplierInvoiceEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `si:list:p${page}:l${limit}:q${search || ''}:s${status || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findAllByTenant(
          tenantId,
          page,
          limit,
          search,
          status,
        )
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300,
      tenantId,
    )
  }

  async findOneInvoice(id: string, ctx: RequestContextDto): Promise<SupplierInvoiceEntity> {
    const tenantId = ctx.tenantId
    const invoice = await this.repository.findByIdWithRelations(id, tenantId)
    if (!invoice) {
      throw new NotFoundException('Supplier Invoice not found')
    }
    return invoice
  }

  async payInvoice(
    id: string,
    dto: RecordSupplierPaymentDto,
    ctx: RequestContextDto,
  ): Promise<SupplierInvoiceEntity> {
    this.logger.log(`Recording payment for invoice ${id}`)
    const tenantId = ctx.tenantId

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const invoice = await this.repository.findByIdWithRelations(id, tenantId, queryRunner.manager)
      if (!invoice) {
        throw new NotFoundException('Supplier Invoice not found')
      }

      if (invoice.status === SupplierInvoiceStatus.PAID) {
        throw new BadRequestException('Invoice is already fully paid')
      }

      // 1. Record Supplier Payment
      await this.paymentRepository.createAndSave(
        {
          purchaseOrderId: invoice.purchaseOrderId,
          supplierId: invoice.supplierId,
          amount: Number(dto.amount),
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          paymentMethod: dto.paymentMethod,
          transactionId: dto.transactionId || null,
          note: dto.note || `Payment against Invoice #${invoice.invoiceNumber}`,
          tenantId,
        },
        ctx,
        queryRunner.manager,
      )

      // 2. Update Invoice Paid Amount
      invoice.paidAmount = Number(invoice.paidAmount || 0) + Number(dto.amount)
      if (invoice.paidAmount >= Number(invoice.totalAmount)) {
        invoice.status = SupplierInvoiceStatus.PAID
      }

      const savedInvoice = await queryRunner.manager.save(SupplierInvoiceEntity, invoice)

      // 3. Post to Accounts Payable Ledger (Debit, reducing liability)
      const lastEntry = await queryRunner.manager
        .createQueryBuilder(SupplierAPLedgerEntity, 'ap')
        .setLock('pessimistic_write')
        .where('ap.supplierId = :supplierId', { supplierId: invoice.supplierId })
        .andWhere('ap.tenantId = :tenantId', { tenantId })
        .orderBy('ap.createdAt', 'DESC')
        .getOne()

      const balanceAfter = (lastEntry ? Number(lastEntry.balanceAfter) : 0) - Number(dto.amount)

      const entry = queryRunner.manager.create(SupplierAPLedgerEntity, {
        supplierId: invoice.supplierId,
        tenantId,
        referenceType: SupplierAPReferenceType.PAYMENT,
        referenceId: invoice.id,
        debit: Number(dto.amount),
        credit: 0,
        balanceAfter,
        remarks: `Payment against Invoice #${invoice.invoiceNumber}`,
      })
      await queryRunner.manager.save(entry)

      await queryRunner.commitTransaction()

      await this.accountingQueue.add(
        'post-supplier-invoice-payment',
        {
          ctx,
          payload: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: Number(dto.amount),
          },
        },
        { removeOnComplete: true },
      ).catch((err) => {
        this.logger.error(`Failed to queue supplier invoice payment journal entry: ${err.message}`)
      })

      await this.cacheService.delCacheByPattern(`si:list*`, tenantId)
      await this.cacheService.delCache(`si:id:${invoice.id}`, tenantId)

      return savedInvoice
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async updateStatus(
    id: string,
    dto: UpdateSupplierInvoiceStatusDto,
    ctx: RequestContextDto,
  ): Promise<SupplierInvoiceEntity> {
    const tenantId = ctx.tenantId
    const invoice = await this.findOneInvoice(id, ctx)

    if (invoice.status === SupplierInvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update status of a paid invoice')
    }

    invoice.status = dto.status
    if (dto.discrepancyNotes) {
      invoice.discrepancyNotes = dto.discrepancyNotes
    }

    const saved = await this.repository.saveInvoice(invoice)
    await this.cacheService.delCacheByPattern(`si:list*`, tenantId)
    await this.cacheService.delCache(`si:id:${id}`, tenantId)
    return saved
  }

  async getApAgingReport(ctx: RequestContextDto): Promise<any[]> {
    this.logger.log('Generating Accounts Payable (AP) aging report')
    const tenantId = ctx.tenantId
    const em = this.dataSource.manager

    const suppliers = await em.getRepository(SupplierEntity).find({
      where: { tenantId },
      order: { name: 'ASC' },
    })

    const report: any[] = []
    const now = new Date()

    for (const supplier of suppliers) {
      const invoices = await em.find(SupplierInvoiceEntity, {
        where: {
          supplierId: supplier.id,
          tenantId,
        },
      })

      const unpaidInvoices = invoices.filter(
        (inv) =>
          inv.status !== SupplierInvoiceStatus.PAID &&
          inv.status !== SupplierInvoiceStatus.CANCELLED,
      )

      if (unpaidInvoices.length === 0) continue

      let current = 0
      let d1to30 = 0
      let d31to60 = 0
      let d61to90 = 0
      let d90plus = 0
      let totalOutstanding = 0

      for (const invoice of unpaidInvoices) {
        const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount || 0)
        if (outstanding <= 0) continue

        totalOutstanding += outstanding

        const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.invoiceDate)
        const diffTime = now.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 0) {
          current += outstanding
        } else if (diffDays <= 30) {
          d1to30 += outstanding
        } else if (diffDays <= 60) {
          d31to60 += outstanding
        } else if (diffDays <= 90) {
          d61to90 += outstanding
        } else {
          d90plus += outstanding
        }
      }

      if (totalOutstanding > 0) {
        report.push({
          supplierId: supplier.id,
          supplierName: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          totalOutstanding,
          aging: {
            current,
            '1-30': d1to30,
            '31-60': d31to60,
            '61-90': d61to90,
            '90+': d90plus,
          },
        })
      }
    }

    return report
  }

  async batchPayInvoices(
    dto: {
      invoiceIds: string[]
      paymentMethod: string
      transactionId?: string
      note?: string
    },
    ctx: RequestContextDto,
  ): Promise<any> {
    this.logger.log(`Executing batch payment run for ${dto.invoiceIds.length} invoices`)
    const results: any[] = []
    const errors: any[] = []

    for (const invoiceId of dto.invoiceIds) {
      try {
        const invoice = await this.findOneInvoice(invoiceId, ctx)
        const balance = Number(invoice.totalAmount) - Number(invoice.paidAmount || 0)

        if (balance <= 0) {
          errors.push({ invoiceId, error: 'Invoice is already fully paid' })
          continue
        }

        const payDto: RecordSupplierPaymentDto = {
          amount: balance,
          paymentDate: new Date().toISOString(),
          paymentMethod: dto.paymentMethod,
          transactionId: dto.transactionId || null,
          note: dto.note || `Batch Payment Run - Invoice #${invoice.invoiceNumber}`,
        }

        const updatedInvoice = await this.payInvoice(invoiceId, payDto, ctx)
        results.push({
          invoiceId,
          status: 'PAID',
          amountPaid: balance,
          invoiceNumber: updatedInvoice.invoiceNumber,
        })
      } catch (err: any) {
        errors.push({ invoiceId, error: err.message || 'Payment execution failed' })
      }
    }

    return {
      processedCount: results.length,
      failedCount: errors.length,
      payments: results,
      failures: errors,
    }
  }
}
