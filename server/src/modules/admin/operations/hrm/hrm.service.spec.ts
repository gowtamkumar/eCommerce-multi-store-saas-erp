import { Test, TestingModule } from '@nestjs/testing'
import { HrmAttendanceService } from './services/hrm-attendance.service'
import { HrmEmployeeService } from './services/hrm-employee.service'
import { HrmLeaveService } from './services/hrm-leave.service'
import { HrmOrganizationService } from './services/hrm-organization.service'
import { HrmPayrollService } from './services/hrm-payroll.service'
import { HrmPerformanceService } from './services/hrm-performance.service'
import { HrmRecruitmentService } from './services/hrm-recruitment.service'
import { HrmService } from './hrm.service'

describe('HrmService', () => {
  let service: HrmService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmService,
        {
          provide: HrmOrganizationService,
          useValue: {},
        },
        {
          provide: HrmEmployeeService,
          useValue: {},
        },
        {
          provide: HrmAttendanceService,
          useValue: {},
        },
        {
          provide: HrmLeaveService,
          useValue: {},
        },
        {
          provide: HrmPayrollService,
          useValue: {},
        },
        {
          provide: HrmRecruitmentService,
          useValue: {},
        },
        {
          provide: HrmPerformanceService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<HrmService>(HrmService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
