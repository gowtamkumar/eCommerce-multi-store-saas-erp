import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SupplierRepository {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly repo: Repository<SupplierEntity>,
  ) {}

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<SupplierEntity> {
    const supplier = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as SupplierEntity)
    return await this.repo.save(supplier)
  }

  /**
   * Fetches paginated suppliers for a tenant.
   * Supports server-side searching on name and contact name.
   */
  async findAllByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<[SupplierEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('supplier')
      .where('supplier.tenantId = :tenantId', { tenantId })
      .orderBy('supplier.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere(
        '(supplier.name ILIKE :search OR supplier.contactName ILIKE :search OR supplier.email ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    return await qb.getManyAndCount()
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<SupplierEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
    })
  }

  async findByUserIdAndTenant(userId: string, tenantId: string): Promise<SupplierEntity | null> {
    return await this.repo.findOne({
      where: { userId, tenantId },
    })
  }

  async updateAndSave(supplier: SupplierEntity, dto: any): Promise<SupplierEntity> {
    Object.assign(supplier, dto)
    return await this.repo.save(supplier)
  }

  async removeSupplier(supplier: SupplierEntity): Promise<SupplierEntity> {
    return await this.repo.softRemove(supplier)
  }
}
