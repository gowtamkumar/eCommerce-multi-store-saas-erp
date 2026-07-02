import { getTransactionalRepo } from '@/common/utils/repository.util'
import { BadRequestException } from '@nestjs/common'
import {
  EntityManager,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'

export type SortDirection = 'ASC' | 'DESC'

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** Minimum shape for store-scoped persistence (BaseEntity and BaseStoreEntity both qualify). */
export type StoreScopedEntity = { id: string; storeId?: string }

/**
 * Store-scoped repository base.
 * Centralizes transactional repo selection, store filtering, and pagination helpers.
 */
export abstract class BaseStoreRepository<T extends StoreScopedEntity> {
  protected constructor(
    protected readonly entity: { new (...args: any[]): T },
    protected readonly repo: Repository<T>,
  ) {}

  /**
   * Enforces strict validation of store ID parameter.
   * Throws BadRequestException on missing, empty, or invalid placeholder values.
   */
  protected validateStoreId(storeId: string): void {
    if (
      !storeId ||
      typeof storeId !== 'string' ||
      storeId.trim() === '' ||
      storeId === 'undefined' ||
      storeId === 'null'
    ) {
      throw new BadRequestException('Invalid or missing store context')
    }
  }

  /** Returns transactional repository when manager is provided, otherwise the default repo. */
  protected txRepo(manager?: EntityManager): Repository<T> {
    return getTransactionalRepo(this.entity, this.repo, manager)
  }

  async findByIdScoped(id: string, storeId: string, manager?: EntityManager): Promise<T | null> {
    this.validateStoreId(storeId)
    return this.txRepo(manager).findOne({
      where: { id, storeId } as FindOptionsWhere<T>,
    })
  }

  async findAllScoped(
    storeId: string,
    options?: Omit<FindManyOptions<T>, 'where'> & { where?: FindOptionsWhere<T> },
    manager?: EntityManager,
  ): Promise<T[]> {
    this.validateStoreId(storeId)
    const where = { storeId, ...(options?.where ?? {}) } as FindOptionsWhere<T>
    return this.txRepo(manager).find({
      ...options,
      where,
    })
  }

  async countScoped(storeId: string, manager?: EntityManager): Promise<number> {
    this.validateStoreId(storeId)
    return this.txRepo(manager).count({
      where: { storeId } as FindOptionsWhere<T>,
    })
  }

  async softRemoveScoped(entity: T, manager?: EntityManager): Promise<void> {
    await this.txRepo(manager).softRemove(entity)
  }

  /**
   * Applies store scope to a query builder alias.
   */
  protected applyStoreScope(
    qb: SelectQueryBuilder<T>,
    storeId: string,
    alias: string,
  ): SelectQueryBuilder<T> {
    this.validateStoreId(storeId)
    return qb.andWhere(`${alias}.storeId = :storeId`, { storeId })
  }

  /**
   * Paginates a query builder with a whitelisted sort column map.
   */
  protected async paginateQueryBuilder(
    qb: SelectQueryBuilder<T>,
    options: PaginationOptions & {
      sortBy?: string
      sortOrder?: SortDirection
      sortableColumns?: Record<string, string>
      defaultSortColumn?: string
    },
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.max(1, Number(options.limit) || 10)
    const skip = (page - 1) * limit

    const sortable = options.sortableColumns ?? {}
    const defaultColumn = options.defaultSortColumn ?? Object.values(sortable)[0]
    const sortColumn =
      options.sortBy && sortable[options.sortBy] ? sortable[options.sortBy] : defaultColumn
    const sortDirection: SortDirection = options.sortOrder === 'ASC' ? 'ASC' : 'DESC'

    if (sortColumn) {
      qb.orderBy(sortColumn, sortDirection)
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount()

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }
  }

  /**
   * Simple find-based pagination with store scope and optional order.
   */
  protected async paginateScoped(
    storeId: string,
    options: PaginationOptions & {
      order?: FindOptionsOrder<T>
      where?: FindOptionsWhere<T>
    },
    manager?: EntityManager,
  ): Promise<PaginatedResult<T>> {
    this.validateStoreId(storeId)
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.max(1, Number(options.limit) || 10)
    const skip = (page - 1) * limit
    const where = { storeId, ...(options.where ?? {}) } as FindOptionsWhere<T>

    const [items, total] = await this.txRepo(manager).findAndCount({
      where,
      order: options.order,
      skip,
      take: limit,
    })

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }
  }
}
