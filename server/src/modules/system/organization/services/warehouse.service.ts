import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateWarehouseBinDto, CreateWarehouseDto, UpdateWarehouseBinDto, UpdateWarehouseDto } from '../dto/warehouse.dto'
import { WarehouseBinEntity } from '../entities/warehouse-bin.entity'
import { WarehouseEntity } from '../entities/warehouse.entity'
import { WarehouseBinRepository } from '../repositories/warehouse-bin.repository'
import { WarehouseRepository } from '../repositories/warehouse.repository'

@Injectable()
export class WarehouseService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
    private readonly binRepository: WarehouseBinRepository,
  ) {}

  async findAll(ctx: RequestContextDto): Promise<WarehouseEntity[]> {
    return this.warehouseRepository.findAll(ctx.tenantId)
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<WarehouseEntity> {
    const warehouse = await this.warehouseRepository.findOne(id, ctx.tenantId)
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found')
    }
    return warehouse
  }

  async create(createWarehouseDto: CreateWarehouseDto, ctx: RequestContextDto): Promise<WarehouseEntity> {
    const existing = await this.warehouseRepository.findByCode(createWarehouseDto.code, ctx.tenantId)
    if (existing) {
      throw new ConflictException('Warehouse code already exists')
    }
    return this.warehouseRepository.create(createWarehouseDto, ctx)
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto, ctx: RequestContextDto): Promise<WarehouseEntity> {
    const warehouse = await this.findOne(id, ctx)
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existing = await this.warehouseRepository.findByCode(updateWarehouseDto.code, ctx.tenantId)
      if (existing) {
        throw new ConflictException('Warehouse code already exists')
      }
    }
    return this.warehouseRepository.update(warehouse, updateWarehouseDto)
  }

  async remove(id: string, ctx: RequestContextDto): Promise<void> {
    const warehouse = await this.findOne(id, ctx)
    await this.warehouseRepository.remove(warehouse)
  }

  // Bin Management
  async addBin(warehouseId: string, createBinDto: CreateWarehouseBinDto, ctx: RequestContextDto): Promise<WarehouseBinEntity> {
    await this.findOne(warehouseId, ctx)
    const existing = await this.binRepository.findByCode(warehouseId, createBinDto.binCode)
    if (existing) {
      throw new ConflictException('Bin code already exists in this warehouse')
    }
    return this.binRepository.create({ ...createBinDto, warehouseId }, ctx)
  }

  async updateBin(binId: string, updateBinDto: UpdateWarehouseBinDto, ctx: RequestContextDto): Promise<WarehouseBinEntity> {
    const bin = await this.binRepository.findOne(binId)
    if (!bin) throw new NotFoundException('Bin not found')
    
    // Ensure the warehouse belongs to the tenant
    await this.findOne(bin.warehouseId, ctx)

    if (updateBinDto.binCode && updateBinDto.binCode !== bin.binCode) {
      const existing = await this.binRepository.findByCode(bin.warehouseId, updateBinDto.binCode)
      if (existing) {
        throw new ConflictException('Bin code already exists in this warehouse')
      }
    }
    return this.binRepository.update(bin, updateBinDto)
  }

  async removeBin(binId: string, ctx: RequestContextDto): Promise<void> {
    const bin = await this.binRepository.findOne(binId)
    if (!bin) throw new NotFoundException('Bin not found')
    await this.findOne(bin.warehouseId, ctx)
    await this.binRepository.remove(bin)
  }
}
