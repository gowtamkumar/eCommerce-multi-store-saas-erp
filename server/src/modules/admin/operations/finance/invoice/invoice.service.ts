import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { InvoiceRepository } from './invoice.repository'
import { InvoiceEntity } from './entities/invoice.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AccountingOutboxService } from '@/modules/admin/operations/finance/accounting/services/accounting-outbox.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name)

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly orderRepo: OrderRepository,
    private readonly cacheService: CacheService,
    private readonly accountingOutboxService: AccountingOutboxService,
  ) { }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    ctx: RequestContextDto,
  ): Promise<InvoiceEntity> {
    this.logger.log(`${this.createInvoice.name} Service Called`)
    const storeId = ctx.storeId

    const order = await this.orderRepo.findOrderById(createInvoiceDto.orderId, storeId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    let invoiceNumber = createInvoiceDto.invoiceNumber
    if (!invoiceNumber) {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')

      let attempts = 0
      let exists = true
      while (exists && attempts < 5) {
        attempts++
        const random = Math.floor(1000 + Math.random() * 9000)
        invoiceNumber = `INV-${year}${month}-${random}`
        exists = await this.invoiceRepository.checkInvoiceNumberExists(invoiceNumber, storeId)
      }
    }

    const invoice = await this.invoiceRepository.createAndSave(
      {
        ...createInvoiceDto,
        invoiceNumber,
        storeId,
        issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
        dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
        status: createInvoiceDto.status || InvoiceStatus.PENDING,
      } as any,
      ctx,
    )

    // Post AR / Revenue GL journal when invoice is created (amount comes from the linked order)
    try {
      const totalAmount = Number((order as any).totalAmount || (order as any).grandTotal || 0)
      if (totalAmount > 0) {
        await this.accountingOutboxService.enqueueJournalEntry(
          {
            type: JournalType.SALES,
            description: `Invoice Created - ${invoice.invoiceNumber}`,
            referenceType: 'CUSTOMER_INVOICE',
            referenceId: invoice.id,
            lines: [
              { accountCode: '1200', side: LedgerEntrySide.DEBIT, amount: totalAmount },  // Accounts Receivable
              { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: totalAmount }, // Sales Revenue
            ],
          },
          ctx,
        )
      }
    } catch (glErr: any) {
      this.logger.error(`Failed to enqueue GL for invoice ${invoice.id}: ${glErr.message}`)
    }

    await this.cacheService.delCacheByPattern(`invoices:list*`, storeId)
    return invoice
  }

  async findAllInvoices(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: InvoiceStatus,
  ): Promise<{
    items: InvoiceEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    this.logger.log(`${this.findAllInvoices.name} Service Called`)
    const storeId = ctx.storeId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `invoices:list:p${page}:l${limit}:q${search || ''}:s${status || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.invoiceRepository.findAllWithRelations(
          storeId,
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
      storeId,
    )
  }

  async findOneInvoice(id: string, ctx: RequestContextDto): Promise<InvoiceEntity> {
    this.logger.log(`${this.findOneInvoice.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `invoices:id:${id}`

    const invoice = await this.cacheService.rememberCache(
      cacheKey,
      () => this.invoiceRepository.findByIdWithRelations(id, storeId),
      600,
      storeId,
    )

    if (!invoice) {
      throw new NotFoundException('Invoice not found')
    }

    return invoice
  }

  async updateInvoice(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    ctx: RequestContextDto,
  ): Promise<InvoiceEntity> {
    this.logger.log(`${this.updateInvoice.name} Service Called`)
    const storeId = ctx.storeId
    const invoice = await this.findOneInvoice(id, ctx)

    const updateData: any = { ...updateInvoiceDto }
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate)
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }

    const updatedInvoice = await this.invoiceRepository.updateAndSave(invoice, updateData)
    await this.cacheService.delCacheByPattern(`invoices:list*`, storeId)
    await this.cacheService.delCache(`invoices:id:${id}`, storeId)
    return updatedInvoice
  }

  async removeInvoice(id: string, ctx: RequestContextDto): Promise<InvoiceEntity> {
    this.logger.log(`${this.removeInvoice.name} Service Called`)
    const storeId = ctx.storeId
    const invoice = await this.findOneInvoice(id, ctx)
    const removedInvoice = await this.invoiceRepository.removeInvoice(invoice)

    // Post a reversal journal entry to undo the AR recognition
    try {
      const totalAmount = Number((invoice as any).totalAmount || (invoice as any).amount || 0)
      if (totalAmount > 0) {
        await this.accountingOutboxService.enqueueJournalEntry(
          {
            type: JournalType.SALES,
            description: `Invoice Voided - ${invoice.invoiceNumber}`,
            referenceType: 'CUSTOMER_INVOICE_VOID',
            referenceId: invoice.id,
            lines: [
              { accountCode: '4000', side: LedgerEntrySide.DEBIT, amount: totalAmount },  // Reverse Revenue
              { accountCode: '1200', side: LedgerEntrySide.CREDIT, amount: totalAmount }, // Reduce AR
            ],
          },
          ctx,
        )
      }
    } catch (glErr: any) {
      this.logger.error(`Failed to enqueue void GL for invoice ${invoice.id}: ${glErr.message}`)
    }

    await this.cacheService.delCacheByPattern(`invoices:list*`, storeId)
    await this.cacheService.delCache(`invoices:id:${id}`, storeId)
    return removedInvoice
  }

  async updateInvoiceStatusByOrderId(
    orderId: string,
    status: InvoiceStatus,
    ctx: RequestContextDto,
  ): Promise<void> {
    this.logger.log(`${this.updateInvoiceStatusByOrderId.name} Service Called`)
    const storeId = ctx.storeId
    const invoice = await this.invoiceRepository.findByOrderId(orderId, storeId)
    if (invoice) {
      await this.invoiceRepository.updateAndSave(invoice, { status })
      await this.cacheService.delCacheByPattern(`invoices:list*`, storeId)
      await this.cacheService.delCache(`invoices:id:${invoice.id}`, storeId)
    }
  }
}
