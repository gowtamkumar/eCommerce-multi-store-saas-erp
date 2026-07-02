import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { PageEntity } from '@/modules/admin/content/page/entities/page.entity'
import { FilterUserDto } from '@/modules/admin/core/user/dtos'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

/**
 * Centralizes cross-store read access for Super Admin features. These queries
 * intentionally bypass store scoping and must only be reachable from
 * Super Admin guarded routes.
 */
@Injectable()
export class SuperAdminCrossStoreRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAllProductsCrossStore(): Promise<ProductEntity[]> {
    return this.dataSource.getRepository(ProductEntity).find()
  }

  async findAllPagesCrossStore(): Promise<PageEntity[]> {
    return this.dataSource.getRepository(PageEntity).find()
  }

  async findAllUsersCrossStore(filterDto: FilterUserDto): Promise<[UserEntity[], number]> {
    const { page = 1, limit = 10, q, role, status } = filterDto
    const query = this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.store', 'store')

    if (q) {
      query.andWhere('(user.name ILIKE :q OR user.email ILIKE :q OR user.username ILIKE :q)', {
        q: `%${q}%`,
      })
    }

    if (role) {
      query.andWhere('user.role = :role', { role })
    }

    if (status) {
      query.andWhere('user.status = :status', { status })
    }

    return await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }
}
