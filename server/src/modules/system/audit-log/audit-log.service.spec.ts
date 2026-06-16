import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogRepository } from './audit-log.repository'
import { AuditLogService } from './audit-log.service'

describe('AuditLogService', () => {
  let service: AuditLogService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: AuditLogRepository,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<AuditLogService>(AuditLogService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
