import { Test, TestingModule } from '@nestjs/testing'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { UserRoleAssignmentService } from './user-role-assignment.service'
import { UserRoleAssignmentRepository } from '@/modules/admin/core/user/repositories/user-role-assignment.repository'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'

describe('UserRoleAssignmentService', () => {
  let service: UserRoleAssignmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleAssignmentService,
        {
          provide: UserRoleAssignmentRepository,
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
          provide: RoleRepository,
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
          provide: AuditLogService,
          useValue: {},
        },
        {
          provide: PermissionResolutionService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<UserRoleAssignmentService>(UserRoleAssignmentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
