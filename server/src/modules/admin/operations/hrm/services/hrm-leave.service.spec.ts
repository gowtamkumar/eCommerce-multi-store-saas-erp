import { Test, TestingModule } from '@nestjs/testing'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'
import { HrmLeaveService } from './hrm-leave.service'

describe('HrmLeaveService', () => {
  let service: HrmLeaveService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmLeaveService,
        {
          provide: HrmRepository,
          useValue: {},
        },
        {
          provide: AuditLogService,
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

    service = module.get<HrmLeaveService>(HrmLeaveService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
