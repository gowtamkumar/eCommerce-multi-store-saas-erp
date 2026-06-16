import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'
import { HrmAttendanceService } from './hrm-attendance.service'

describe('HrmAttendanceService', () => {
  let service: HrmAttendanceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmAttendanceService,
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

    service = module.get<HrmAttendanceService>(HrmAttendanceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
