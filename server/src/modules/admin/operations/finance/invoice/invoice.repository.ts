import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InvoiceEntity } from './entities/invoice.entity'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) {}

  async checkInvoiceNumberExists(invoiceNumber: string, tenantId: string): Promise<boolean> {
    const exists = await this.repo.findOne({ where: { invoiceNumber, tenantId } })
    return !!exists
  }

  async createAndSave(
    data: Partial<InvoiceEntity>,
    ctx: RequestContextDto,
  ): Promise<InvoiceEntity> {
    const invoice = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as InvoiceEntity)
    return this.repo.save(invoice)
  }

  /**
   * Fetches paginated invoices for the admin dashboard.
   * Optimizes by selecting only necessary fields and reducing join depth.
   */
  async findAllWithRelations(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: InvoiceStatus,
  ): Promise<[InvoiceEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.order', 'order')
      .leftJoinAndSelect('invoice.user', 'user')
      .where('invoice.tenantId = :tenantId', { tenantId })
      .orderBy('invoice.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere(
        '(invoice.invoiceNumber ILIKE :search OR order.customerName ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      qb.andWhere('invoice.status = :status', { status })
    }

    return qb.getManyAndCount()
  }

  async findByIdWithRelations(id: string, tenantId: string): Promise<InvoiceEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: {
        order: {
          items: {
            product: true,
          },
        },
        user: true,
      },
    })
  }

  async findByOrderId(orderId: string, tenantId: string): Promise<InvoiceEntity | null> {
    return this.repo.findOne({ where: { orderId, tenantId } })
  }

  async updateAndSave(
    invoice: InvoiceEntity,
    data: Partial<InvoiceEntity>,
  ): Promise<InvoiceEntity> {
    Object.assign(invoice, data)
    return this.repo.save(invoice)
  }

  async removeInvoice(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    return this.repo.softRemove(invoice)
  }
}
