import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { SupplierEntity } from './entities/supplier.entity'

@Injectable()
export class SupplierRepository extends Repository<SupplierEntity> {
  constructor(private dataSource: DataSource) {
    super(SupplierEntity, dataSource.createEntityManager())
  }

  async createAndSave(dto: any, tenantId: string): Promise<SupplierEntity> {
    const supplier = this.create({
      ...dto,
      tenantId,
    } as SupplierEntity)
    return await this.save(supplier)
  }

  async findAllByTenant(tenantId: string): Promise<SupplierEntity[]> {
    return await this.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<SupplierEntity | null> {
    return await this.findOne({
      where: { id, tenantId },
    })
  }

  async updateAndSave(supplier: SupplierEntity, dto: any): Promise<SupplierEntity> {
    Object.assign(supplier, dto)
    return await this.save(supplier)
  }

  async removeSupplier(supplier: SupplierEntity): Promise<SupplierEntity> {
    return await this.softRemove(supplier)
  }
}
