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

/** Minimum shape for tenant-scoped persistence (BaseEntity and BaseTenantEntity both qualify). */
export type TenantScopedEntity = { id: string; tenantId?: string }

/**
 * Tenant-scoped repository base.
 * Centralizes transactional repo selection, tenant filtering, and pagination helpers.
 */
export abstract class BaseTenantRepository<T extends TenantScopedEntity> {
  protected constructor(
    protected readonly entity: { new (...args: any[]): T },
    protected readonly repo: Repository<T>,
  ) {}

  /**
   * Enforces strict validation of tenant ID parameter.
   * Throws BadRequestException on missing, empty, or invalid placeholder values.
   */
  protected validateTenantId(tenantId: string): void {
    if (
      !tenantId ||
      typeof tenantId !== 'string' ||
      tenantId.trim() === '' ||
      tenantId === 'undefined' ||
      tenantId === 'null'
    ) {
      throw new BadRequestException('Invalid or missing tenant context')
    }
  }

  /** Returns transactional repository when manager is provided, otherwise the default repo. */
  protected txRepo(manager?: EntityManager): Repository<T> {
    return getTransactionalRepo(this.entity, this.repo, manager)
  }

  async findByIdScoped(id: string, tenantId: string, manager?: EntityManager): Promise<T | null> {
    this.validateTenantId(tenantId)
    return this.txRepo(manager).findOne({
      where: { id, tenantId } as FindOptionsWhere<T>,
    })
  }

  async findAllScoped(
    tenantId: string,
    options?: Omit<FindManyOptions<T>, 'where'> & { where?: FindOptionsWhere<T> },
    manager?: EntityManager,
  ): Promise<T[]> {
    this.validateTenantId(tenantId)
    const where = { tenantId, ...(options?.where ?? {}) } as FindOptionsWhere<T>
    return this.txRepo(manager).find({
      ...options,
      where,
    })
  }

  async countScoped(tenantId: string, manager?: EntityManager): Promise<number> {
    this.validateTenantId(tenantId)
    return this.txRepo(manager).count({
      where: { tenantId } as FindOptionsWhere<T>,
    })
  }

  async softRemoveScoped(entity: T, manager?: EntityManager): Promise<void> {
    await this.txRepo(manager).softRemove(entity)
  }

  /**
   * Applies tenant scope to a query builder alias.
   */
  protected applyTenantScope(
    qb: SelectQueryBuilder<T>,
    tenantId: string,
    alias: string,
  ): SelectQueryBuilder<T> {
    this.validateTenantId(tenantId)
    return qb.andWhere(`${alias}.tenantId = :tenantId`, { tenantId })
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
   * Simple find-based pagination with tenant scope and optional order.
   */
  protected async paginateScoped(
    tenantId: string,
    options: PaginationOptions & {
      order?: FindOptionsOrder<T>
      where?: FindOptionsWhere<T>
    },
    manager?: EntityManager,
  ): Promise<PaginatedResult<T>> {
    this.validateTenantId(tenantId)
    const page = Math.max(1, Number(options.page) || 1)
    const limit = Math.max(1, Number(options.limit) || 10)
    const skip = (page - 1) * limit
    const where = { tenantId, ...(options.where ?? {}) } as FindOptionsWhere<T>

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
