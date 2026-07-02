import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InvoiceEntity } from './entities/invoice.entity'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class InvoiceRepository extends BaseStoreRepository<InvoiceEntity> {
  constructor(
    @InjectRepository(InvoiceEntity)
    repo: Repository<InvoiceEntity>,
  ) {
    super(InvoiceEntity, repo)
}

  async checkInvoiceNumberExists(invoiceNumber: string, storeId: string): Promise<boolean> {
    const exists = await this.repo.findOne({ where: { invoiceNumber, storeId } })
    return !!exists
  }

  async createAndSave(
    data: Partial<InvoiceEntity>,
    ctx: RequestContextDto,
  ): Promise<InvoiceEntity> {
    const invoice = this.repo.create({
      ...data,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as InvoiceEntity)
    return this.repo.save(invoice)
  }

  /**
   * Fetches paginated invoices for the admin dashboard.
   * Optimizes by selecting only necessary fields and reducing join depth.
   */
  async findAllWithRelations(
    storeId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: InvoiceStatus,
  ): Promise<[InvoiceEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.order', 'order')
      .leftJoinAndSelect('invoice.user', 'user')
      .where('invoice.storeId = :storeId', { storeId })
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

  async findByIdWithRelations(id: string, storeId: string): Promise<InvoiceEntity | null> {
    return this.repo.findOne({
      where: { id, storeId },
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

  async findByOrderId(orderId: string, storeId: string): Promise<InvoiceEntity | null> {
    return this.repo.findOne({ where: { orderId, storeId } })
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
