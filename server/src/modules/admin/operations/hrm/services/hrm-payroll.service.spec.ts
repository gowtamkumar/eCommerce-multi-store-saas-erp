import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'
import { HrmPayrollService } from './hrm-payroll.service'

describe('HrmPayrollService', () => {
  let service: HrmPayrollService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmPayrollService,
        {
          provide: HrmRepository,
          useValue: {},
        },
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: jest.fn(),
          },
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

    service = module.get<HrmPayrollService>(HrmPayrollService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
