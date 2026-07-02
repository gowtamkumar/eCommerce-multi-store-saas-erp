import { EntityManager, Repository } from 'typeorm'
import { BaseStoreRepository, StoreScopedEntity } from './base-store.repository'

class TestEntity implements StoreScopedEntity {
  id: string
  storeId: string
}

class TestRepository extends BaseStoreRepository<TestEntity> {
  constructor(repo: Repository<TestEntity>) {
    super(TestEntity, repo)
  }

  exposePaginateScoped(
    storeId: string,
    options: { page?: number; limit?: number },
    manager?: EntityManager,
  ) {
    return this.paginateScoped(storeId, options, manager)
  }
}

describe('BaseStoreRepository', () => {
  const entity = { id: 'e1', storeId: 't1' } as TestEntity

  it('findByIdScoped applies store filter', async () => {
    const findOne = jest.fn().mockResolvedValue(entity)
    const repo = { findOne } as unknown as Repository<TestEntity>
    const testRepo = new TestRepository(repo)

    const result = await testRepo.findByIdScoped('e1', 't1')

    expect(findOne).toHaveBeenCalledWith({ where: { id: 'e1', storeId: 't1' } })
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
      where: { storeId: 't1' },
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
