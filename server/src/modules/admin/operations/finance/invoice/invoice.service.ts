import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderRepository } from '@/modules/admin/sales/order/repositoris/order.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { InvoiceService as InvoiceServiceBase } from './invoice.service'
import { InvoiceRepository } from './invoice.repository'
import { InvoiceEntity } from './entities/invoice.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'


@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name)

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly orderRepo: OrderRepository,
    private readonly cacheService: CacheService,
  ) { }

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    ctx: RequestContextDto,
  ): Promise<InvoiceEntity> {
    this.logger.log(`${this.createInvoice.name} Service Called`)
    const tenantId = ctx.tenantId

    const order = await this.orderRepo.findOrderById(createInvoiceDto.orderId, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    let invoiceNumber = createInvoiceDto.invoiceNumber
    if (!invoiceNumber) {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const random = Math.floor(1000 + Math.random() * 9000)
      invoiceNumber = `INV-${year}${month}-${random}`

      const exists = await this.invoiceRepository.checkInvoiceNumberExists(
        invoiceNumber,
        tenantId,
      )
      if (exists) {
        invoiceNumber = `INV-${year}${month}-${random + 1}`
      }
    }

    const invoice = await this.invoiceRepository.createAndSave(
      {
        ...createInvoiceDto,
        invoiceNumber,
        tenantId,
        issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
        dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
        status: createInvoiceDto.status || InvoiceStatus.PENDING,
      } as any,
      ctx.userId || order.userId
    )

    await this.cacheService.delCache(`invoices:list`, tenantId)
    return invoice
  }

  async findAllInvoices(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: InvoiceStatus,
  ): Promise<{ items: InvoiceEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`${this.findAllInvoices.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `invoices:list:p${page}:l${limit}:q${search || ''}:s${status || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.invoiceRepository.findAllWithRelations(
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

  async findOneInvoice(id: string, ctx: RequestContextDto): Promise<InvoiceEntity> {
    this.logger.log(`${this.findOneInvoice.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `invoices:id:${id}`

    const invoice = await this.cacheService.rememberCache(
      cacheKey,
      () => this.invoiceRepository.findByIdWithRelations(id, tenantId),
      600,
      tenantId,
    )

    if (!invoice) {
      throw new NotFoundException('Invoice not found')
    }

    return invoice
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, ctx: RequestContextDto): Promise<InvoiceEntity> {
    this.logger.log(`${this.updateInvoice.name} Service Called`)
    const tenantId = ctx.tenantId
    const invoice = await this.findOneInvoice(id, ctx)

    const updateData: any = { ...updateInvoiceDto }
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate)
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }

    const updatedInvoice = await this.invoiceRepository.updateAndSave(invoice, updateData)
    await this.cacheService.delCache(`invoices:list`, tenantId)
    await this.cacheService.delCache(`invoices:id:${id}`, tenantId)
    return updatedInvoice
  }

  async removeInvoice(id: string, ctx: RequestContextDto): Promise<InvoiceEntity> {
    this.logger.log(`${this.removeInvoice.name} Service Called`)
    const tenantId = ctx.tenantId
    const invoice = await this.findOneInvoice(id, ctx)
    const removedInvoice = await this.invoiceRepository.removeInvoice(invoice)
    await this.cacheService.delCache(`invoices:list`, tenantId)
    await this.cacheService.delCache(`invoices:id:${id}`, tenantId)
    return removedInvoice
  }

  async updateInvoiceStatusByOrderId(
    orderId: string,
    status: InvoiceStatus,
    ctx: RequestContextDto,
  ): Promise<void> {
    this.logger.log(`${this.updateInvoiceStatusByOrderId.name} Service Called`)
    const tenantId = ctx.tenantId
    const invoice = await this.invoiceRepository.findByOrderId(orderId, tenantId)
    if (invoice) {
      await this.invoiceRepository.updateAndSave(invoice, { status })
      await this.cacheService.delCache(`invoices:list`, tenantId)
      await this.cacheService.delCache(`invoices:id:${invoice.id}`, tenantId)
    }
  }
}
