import { Test, TestingModule } from '@nestjs/testing'
import { BranchRepository } from '../repositories/branch.repository'
import { BranchService } from './branch.service'

describe('BranchService', () => {
  let service: BranchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        {
          provide: BranchRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<BranchService>(BranchService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
