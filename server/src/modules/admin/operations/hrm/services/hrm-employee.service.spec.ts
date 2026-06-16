import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'

describe('HrmEmployeeService', () => {
  let service: HrmEmployeeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmEmployeeService,
        {
          provide: HrmRepository,
          useValue: {},
        },
        {
          provide: AuditLogService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<HrmEmployeeService>(HrmEmployeeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
