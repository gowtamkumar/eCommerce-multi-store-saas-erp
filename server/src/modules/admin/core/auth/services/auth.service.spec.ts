import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { StaffInvitationService } from '@/modules/admin/core/user/services/staff-invitation.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { SessionEntity } from '../entities/session.entity'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { ReferralService } from '@/modules/admin/marketing/loyalty/services/referral.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: TenantService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              if (defaultValue !== undefined) return defaultValue;
              if (key.includes('PORT')) return 587;
              if (key.includes('SECURE')) return false;
              return '';
            }),
          },
        },
        {
          provide: StaffInvitationService,
          useValue: {},
        },
        {
          provide: PermissionResolutionService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: ReferralService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(SessionEntity),
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
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
