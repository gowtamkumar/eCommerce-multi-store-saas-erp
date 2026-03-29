import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderRepository } from '@/modules/admin/sales/order/order.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { InvoiceRepository } from './invoice.repository'
import { InvoiceEntity } from './entities/invoice.entity'

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name)

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<InvoiceEntity> {
    this.logger.log(`${this.createInvoice.name} Service Called`)
    const orderRepo = manager ? manager.withRepository(this.orderRepository) : this.orderRepository

    const order = await orderRepo.findOne({
      where: { id: createInvoiceDto.orderId, tenantId },
    })

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
        manager,
      )
      if (exists) {
        invoiceNumber = `INV-${year}${month}-${random + 1}`
      }
    }

    return await this.invoiceRepository.createAndSave(
      {
        ...createInvoiceDto,
        invoiceNumber,
        tenantId,
        issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
        dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
        status: createInvoiceDto.status || InvoiceStatus.PENDING,
        userId: order.userId,
      } as any,
      manager,
    )
  }

  async findAllInvoices(tenantId: string): Promise<InvoiceEntity[]> {
    this.logger.log(`${this.findAllInvoices.name} Service Called`)
    return await this.invoiceRepository.findAllWithRelations(tenantId)
  }

  async findOneInvoice(id: string, tenantId: string): Promise<InvoiceEntity> {
    this.logger.log(`${this.findOneInvoice.name} Service Called`)
    const invoice = await this.invoiceRepository.findByIdWithRelations(id, tenantId)

    if (!invoice) {
      throw new NotFoundException('Invoice not found')
    }

    return invoice
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string): Promise<InvoiceEntity> {
    this.logger.log(`${this.updateInvoice.name} Service Called`)
    const invoice = await this.findOneInvoice(id, tenantId)

    const updateData: any = { ...updateInvoiceDto }
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate)
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }

    return await this.invoiceRepository.updateAndSave(invoice, updateData)
  }

  async removeInvoice(id: string, tenantId: string): Promise<InvoiceEntity> {
    this.logger.log(`${this.removeInvoice.name} Service Called`)
    const invoice = await this.findOneInvoice(id, tenantId)
    return await this.invoiceRepository.removeInvoice(invoice)
  }

  async updateInvoiceStatusByOrderId(
    orderId: string,
    status: InvoiceStatus,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<void> {
    this.logger.log(`${this.updateInvoiceStatusByOrderId.name} Service Called`)
    const invoice = await this.invoiceRepository.findByOrderId(orderId, tenantId, manager)
    if (invoice) {
      await this.invoiceRepository.updateAndSave(invoice, { status }, manager)
    }
  }
}
