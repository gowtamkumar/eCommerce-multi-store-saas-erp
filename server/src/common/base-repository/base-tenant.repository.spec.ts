import { EntityManager, Repository } from 'typeorm'
import { BaseTenantRepository, TenantScopedEntity } from './base-tenant.repository'

class TestEntity implements TenantScopedEntity {
  id: string
  tenantId: string
}

class TestRepository extends BaseTenantRepository<TestEntity> {
  constructor(repo: Repository<TestEntity>) {
    super(TestEntity, repo)
  }

  exposePaginateScoped(
    tenantId: string,
    options: { page?: number; limit?: number },
    manager?: EntityManager,
  ) {
    return this.paginateScoped(tenantId, options, manager)
  }
}

describe('BaseTenantRepository', () => {
  const entity = { id: 'e1', tenantId: 't1' } as TestEntity

  it('findByIdScoped applies tenant filter', async () => {
    const findOne = jest.fn().mockResolvedValue(entity)
    const repo = { findOne } as unknown as Repository<TestEntity>
    const testRepo = new TestRepository(repo)

    const result = await testRepo.findByIdScoped('e1', 't1')

    expect(findOne).toHaveBeenCalledWith({ where: { id: 'e1', tenantId: 't1' } })
    expect(result).toBe(entity)
  })

  it('txRepo uses transactional repository when manager is provided', () => {
    const defaultRepo = {} as Repository<TestEntity>
    const transactionalRepo = { findOne: jest.fn() } as unknown as Repository<TestEntity>
    const manager = {
      getRepository: jest.fn().mockReturnValue(transactionalRepo),
    } as unknown as EntityManager

    const testRepo = new TestRepository(defaultRepo)
    const resolved = (testRepo as any).txRepo(manager)

    expect(manager.getRepository).toHaveBeenCalledWith(TestEntity)
    expect(resolved).toBe(transactionalRepo)
  })

  it('paginateScoped returns computed pagination metadata', async () => {
    const findAndCount = jest.fn().mockResolvedValue([[entity], 25])
    const repo = { findAndCount } as unknown as Repository<TestEntity>
    const testRepo = new TestRepository(repo)

    const result = await testRepo.exposePaginateScoped('t1', { page: 2, limit: 10 })

    expect(findAndCount).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      order: undefined,
      skip: 10,
      take: 10,
    })
    expect(result).toEqual({
      items: [entity],
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
    })
  })
})
