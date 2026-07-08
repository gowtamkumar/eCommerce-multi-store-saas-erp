import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateWarehouseBinDto,
  CreateWarehouseDto,
  UpdateWarehouseBinDto,
  UpdateWarehouseDto,
} from '../dto/warehouse.dto'
import { WarehouseBinEntity } from '../entities/warehouse-bin.entity'
import { WarehouseEntity } from '../entities/warehouse.entity'
import { WarehouseBinRepository } from '../repositories/warehouse-bin.repository'
import { WarehouseRepository } from '../repositories/warehouse.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

@Injectable()
export class WarehouseService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
    private readonly binRepository: WarehouseBinRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(ctx: RequestContextDto): Promise<WarehouseEntity[]> {
    return this.cacheService.rememberCache(
      `warehouses:list`,
      () => this.warehouseRepository.findAll(ctx.storeId),
      300,
      ctx.storeId,
    )
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<WarehouseEntity> {
    return this.cacheService.rememberCache(
      `warehouse:${id}`,
      async () => {
        const warehouse = await this.warehouseRepository.findOne(id, ctx.storeId)
        if (!warehouse) {
          throw new NotFoundException('Warehouse not found')
        }
        return warehouse
      },
      300,
      ctx.storeId,
    )
  }

  async create(
    createWarehouseDto: CreateWarehouseDto,
    ctx: RequestContextDto,
  ): Promise<WarehouseEntity> {
    const existing = await this.warehouseRepository.findByCode(
      createWarehouseDto.code,
      ctx.storeId,
    )
    if (existing) {
      throw new ConflictException('Warehouse code already exists')
    }
    const warehouse = await this.warehouseRepository.create(createWarehouseDto, ctx)
    await this.cacheService.delCache(`warehouses:list`, ctx.storeId)
    return warehouse
  }

  async update(
    id: string,
    updateWarehouseDto: UpdateWarehouseDto,
    ctx: RequestContextDto,
  ): Promise<WarehouseEntity> {
    const warehouse = await this.findOne(id, ctx)
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existing = await this.warehouseRepository.findByCode(
        updateWarehouseDto.code,
        ctx.storeId,
      )
      if (existing) {
        throw new ConflictException('Warehouse code already exists')
      }
    }
    const updated = await this.warehouseRepository.update(warehouse, updateWarehouseDto)
    await this.cacheService.delCache(`warehouses:list`, ctx.storeId)
    await this.cacheService.delCache(`warehouse:${id}`, ctx.storeId)
    return updated
  }

  async remove(id: string, ctx: RequestContextDto): Promise<void> {
    const warehouse = await this.findOne(id, ctx)
    await this.warehouseRepository.remove(warehouse)
    await this.cacheService.delCache(`warehouses:list`, ctx.storeId)
    await this.cacheService.delCache(`warehouse:${id}`, ctx.storeId)
  }

  // Bin Management
  async addBin(
    warehouseId: string,
    createBinDto: CreateWarehouseBinDto,
    ctx: RequestContextDto,
  ): Promise<WarehouseBinEntity> {
    await this.findOne(warehouseId, ctx)
    const existing = await this.binRepository.findByCode(warehouseId, createBinDto.binCode)
    if (existing) {
      throw new ConflictException('Bin code already exists in this warehouse')
    }
    const bin = await this.binRepository.create({ ...createBinDto, warehouseId }, ctx)
    await this.cacheService.delCache(`warehouses:list`, ctx.storeId)
    await this.cacheService.delCache(`warehouse:${warehouseId}`, ctx.storeId)
    return bin
  }

  async updateBin(
    binId: string,
    updateBinDto: UpdateWarehouseBinDto,
    ctx: RequestContextDto,
  ): Promise<WarehouseBinEntity> {
    const bin = await this.binRepository.findOne(binId)
    if (!bin) throw new NotFoundException('Bin not found')

    // Ensure the warehouse belongs to the store
    await this.findOne(bin.warehouseId, ctx)

    if (updateBinDto.binCode && updateBinDto.binCode !== bin.binCode) {
      const existing = await this.binRepository.findByCode(bin.warehouseId, updateBinDto.binCode)
      if (existing) {
        throw new ConflictException('Bin code already exists in this warehouse')
      }
    }
    const updated = await this.binRepository.update(bin, updateBinDto)
    await this.cacheService.delCache(`warehouses:list`, ctx.storeId)
    await this.cacheService.delCache(`warehouse:${bin.warehouseId}`, ctx.storeId)
    return updated
  }

  async removeBin(binId: string, ctx: RequestContextDto): Promise<void> {
    const bin = await this.binRepository.findOne(binId)
    if (!bin) throw new NotFoundException('Bin not found')
    await this.findOne(bin.warehouseId, ctx)
    await this.binRepository.remove(bin)
    await this.cacheService.delCache(`warehouses:list`, ctx.storeId)
    await this.cacheService.delCache(`warehouse:${bin.warehouseId}`, ctx.storeId)
  }
}
