import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { StaffInvitationRepository } from '../repositories/staff-invitation.repository'
import { UserRepository } from '../repositories/user.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { UserRoleAssignmentEntity } from '../entities/user-role-assignment.entity'
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
          provide: getRepositoryToken(UserRoleAssignmentEntity),
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
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
            })),
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
