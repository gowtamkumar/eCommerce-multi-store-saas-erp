import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { generateSupplierCode } from './utils/supplier-code.util'

@Injectable()
export class SupplierRepository extends BaseStoreRepository<SupplierEntity> {
  constructor(
    @InjectRepository(SupplierEntity)
    repo: Repository<SupplierEntity>,
  ) {
    super(SupplierEntity, repo)
}

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<SupplierEntity> {
    const { category, categoryId, ...rest } = dto
    if (!rest.code) {
      rest.code = generateSupplierCode()
    }
    const supplier = this.repo.create({
      ...rest,
      categoryId: category || categoryId || null,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as SupplierEntity)
    return await this.repo.save(supplier)
  }

  /**
   * Fetches paginated suppliers for a store.
   * Supports server-side searching on name and contact name.
   */
  async findAllByStore(
    storeId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<[SupplierEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.category', 'category')
      .where('supplier.storeId = :storeId', { storeId })
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

  async findByIdAndStore(id: string, storeId: string): Promise<SupplierEntity | null> {
    return await this.repo.findOne({
      where: { id, storeId },
      relations: {
        category: true,
      },
    })
  }

  async findByUserIdAndStore(userId: string, storeId: string): Promise<SupplierEntity | null> {
    return await this.repo.findOne({
      where: { userId, storeId },
      relations: {
        category: true,
      },
    })
  }

  async updateAndSave(supplier: SupplierEntity, dto: any): Promise<SupplierEntity> {
    const { category, categoryId, ...rest } = dto
    if (rest.hasOwnProperty('code') && !rest.code) {
      rest.code = generateSupplierCode()
    }
    Object.assign(supplier, rest)
    if (category !== undefined || categoryId !== undefined) {
      supplier.categoryId = category || categoryId || null
    }
    return await this.repo.save(supplier)
  }

  async removeSupplier(supplier: SupplierEntity): Promise<SupplierEntity> {
    return await this.repo.softRemove(supplier)
  }
}
