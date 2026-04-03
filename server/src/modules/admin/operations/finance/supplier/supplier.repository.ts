import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupplierEntity } from './entities/supplier.entity'

@Injectable()
export class SupplierRepository {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly repo: Repository<SupplierEntity>,
  ) { }

  async createAndSave(dto: any, tenantId: string): Promise<SupplierEntity> {
    const supplier = this.repo.create({
      ...dto,
      tenantId,
    } as SupplierEntity)
    return await this.repo.save(supplier)
  }

  async findAllByTenant(tenantId: string): Promise<SupplierEntity[]> {
    return await this.repo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<SupplierEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
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
