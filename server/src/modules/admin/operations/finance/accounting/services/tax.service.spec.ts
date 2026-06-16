import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { TaxService } from './tax.service'

describe('TaxService', () => {
  let service: TaxService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<TaxService>(TaxService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
