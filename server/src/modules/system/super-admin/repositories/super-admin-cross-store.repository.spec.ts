import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { SuperAdminCrossStoreRepository } from './super-admin-cross-store.repository'

describe('SuperAdminCrossStoreRepository', () => {
  let repository: SuperAdminCrossStoreRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminCrossStoreRepository,
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn().mockReturnValue({
              find: jest.fn().mockResolvedValue([]),
              createQueryBuilder: jest.fn().mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
              }),
            }),
          },
        },
      ],
    }).compile()

    repository = module.get<SuperAdminCrossStoreRepository>(SuperAdminCrossStoreRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  it('findAllProductsCrossStore delegates to datasource repository', async () => {
    const products = await repository.findAllProductsCrossStore()
    expect(products).toEqual([])
  })
})
