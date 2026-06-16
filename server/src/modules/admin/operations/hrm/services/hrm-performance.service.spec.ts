import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'
import { HrmPerformanceService } from './hrm-performance.service'

describe('HrmPerformanceService', () => {
  let service: HrmPerformanceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmPerformanceService,
        {
          provide: HrmRepository,
          useValue: {},
        },
        {
          provide: AuditLogService,
          useValue: {},
        },
        {
          provide: HrmEmployeeService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<HrmPerformanceService>(HrmPerformanceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
