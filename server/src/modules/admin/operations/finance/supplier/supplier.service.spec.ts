import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SupplierRepository } from './supplier.repository'
import { SupplierAPLedgerRepository } from './supplier-ap-ledger.repository'
import { SupplierAPLedgerEntity } from './entities/supplier-ap-ledger.entity'
import { SupplierService } from './supplier.service'

describe('SupplierService', () => {
  let service: SupplierService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: SupplierRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: SupplierAPLedgerRepository,
          useValue: {},
        },
        {
          provide: getRepositoryToken(SupplierAPLedgerEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
            })),
          },
        },
      ],
    }).compile()

    service = module.get<SupplierService>(SupplierService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
