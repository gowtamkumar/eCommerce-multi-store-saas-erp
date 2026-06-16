import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { FinancialReportService } from './financial-report.service'

describe('FinancialReportService', () => {
  let service: FinancialReportService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialReportService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<FinancialReportService>(FinancialReportService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
