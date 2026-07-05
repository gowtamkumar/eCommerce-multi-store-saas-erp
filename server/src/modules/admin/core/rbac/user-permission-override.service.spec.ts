import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { UserPermissionOverrideService } from './user-permission-override.service'
import { UserPermissionOverrideRepository } from '@/modules/admin/core/user/repositories/user-permission-override.repository'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'

describe('UserPermissionOverrideService', () => {
  let service: UserPermissionOverrideService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPermissionOverrideService,
        {
          provide: UserPermissionOverrideRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndStore: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: AuditLogService,
          useValue: {},
        },
        {
          provide: PermissionResolutionService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<UserPermissionOverrideService>(UserPermissionOverrideService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
