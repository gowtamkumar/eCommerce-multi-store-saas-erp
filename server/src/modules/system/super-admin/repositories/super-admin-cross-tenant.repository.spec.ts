import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { SuperAdminCrossTenantRepository } from './super-admin-cross-tenant.repository'

describe('SuperAdminCrossTenantRepository', () => {
  let repository: SuperAdminCrossTenantRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminCrossTenantRepository,
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

    repository = module.get<SuperAdminCrossTenantRepository>(SuperAdminCrossTenantRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  it('findAllProductsCrossTenant delegates to datasource repository', async () => {
    const products = await repository.findAllProductsCrossTenant()
    expect(products).toEqual([])
  })
})
