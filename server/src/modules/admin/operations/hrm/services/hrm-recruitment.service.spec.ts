import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'
import { HrmRecruitmentService } from './hrm-recruitment.service'

describe('HrmRecruitmentService', () => {
  let service: HrmRecruitmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmRecruitmentService,
        {
          provide: HrmRepository,
          useValue: {},
        },
        {
          provide: AuditLogService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: HrmEmployeeService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<HrmRecruitmentService>(HrmRecruitmentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
