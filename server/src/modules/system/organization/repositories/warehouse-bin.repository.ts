import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WarehouseBinEntity } from '../entities/warehouse-bin.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class WarehouseBinRepository {
  constructor(
    @InjectRepository(WarehouseBinEntity)
    private readonly repo: Repository<WarehouseBinEntity>,
  ) { }

  async findByWarehouse(warehouseId: string): Promise<WarehouseBinEntity[]> {
    return this.repo.find({ where: { warehouseId } })
  }

  async findOne(id: string): Promise<WarehouseBinEntity | null> {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: any, ctx: RequestContextDto): Promise<WarehouseBinEntity> {
    const bin = this.repo.create({
      ...data,
      userId: ctx.userId,
    })
    return this.repo.save(bin) as unknown as Promise<WarehouseBinEntity>
  }

  async update(bin: WarehouseBinEntity, data: any): Promise<WarehouseBinEntity> {
    Object.assign(bin, data)
    return this.repo.save(bin) as unknown as Promise<WarehouseBinEntity>
  }

  async remove(bin: WarehouseBinEntity): Promise<void> {
    await this.repo.remove(bin)
  }

  async findByCode(warehouseId: string, binCode: string): Promise<WarehouseBinEntity | null> {
    return this.repo.findOne({ where: { warehouseId, binCode } })
  }
}
