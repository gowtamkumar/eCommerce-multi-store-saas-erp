import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { StaffInvitationRepository } from '../repositories/staff-invitation.repository'
import { UserRepository } from '../repositories/user.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { UserRoleAssignmentRepository } from '../repositories/user-role-assignment.repository'
import { StaffInvitationService } from './staff-invitation.service'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'

describe('StaffInvitationService', () => {
  let service: StaffInvitationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffInvitationService,
        {
          provide: StaffInvitationRepository,
          useValue: {},
        },
        {
          provide: UserRepository,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
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
          provide: RoleManagementService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<StaffInvitationService>(StaffInvitationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
