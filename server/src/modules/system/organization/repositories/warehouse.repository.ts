import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WarehouseEntity } from '../entities/warehouse.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class WarehouseRepository extends BaseTenantRepository<WarehouseEntity> {
  constructor(
    @InjectRepository(WarehouseEntity)
    repo: Repository<WarehouseEntity>,
  ) {
    super(WarehouseEntity, repo)
}

  async findAll(tenantId: string): Promise<WarehouseEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: {
        branch: true,
      },
    })
  }

  async findOne(id: string, tenantId: string): Promise<WarehouseEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: {
        branch: true,
        bins: true,
      },
    })
  }

  async create(data: any, ctx: RequestContextDto): Promise<WarehouseEntity> {
    const warehouse = this.repo.create({
      ...data,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    })
    return this.repo.save(warehouse) as unknown as Promise<WarehouseEntity>
  }

  async update(warehouse: WarehouseEntity, data: any): Promise<WarehouseEntity> {
    Object.assign(warehouse, data)
    return this.repo.save(warehouse) as unknown as Promise<WarehouseEntity>
  }

  async remove(warehouse: WarehouseEntity): Promise<void> {
    await this.repo.softRemove(warehouse)
  }

  async findByCode(code: string, tenantId: string): Promise<WarehouseEntity | null> {
    return this.repo.findOne({ where: { code, tenantId } })
  }
}
