import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { HrmRepository } from '../hrm.repository'
import { HrmOrganizationService } from './hrm-organization.service'

describe('HrmOrganizationService', () => {
  let service: HrmOrganizationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmOrganizationService,
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

    service = module.get<HrmOrganizationService>(HrmOrganizationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
