import { Test, TestingModule } from '@nestjs/testing'
import { StaffInvitationService } from '@/modules/admin/core/user/services/staff-invitation.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { StoreService } from '@/modules/system/store/store.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'
import { ReferralService } from '@/modules/admin/marketing/loyalty/services/referral.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuthService } from './auth.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SessionRepository } from '../repositories/session.repository'

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
          provide: StoreService,
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
          provide: RoleManagementService,
          useValue: {
            ensureLegacyRoleAssignment: jest.fn().mockResolvedValue(false),
          },
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
          provide: CacheService,
          useValue: {
            getCache: jest.fn().mockResolvedValue(null),
            setCache: jest.fn().mockResolvedValue(undefined),
            delCache: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: SessionRepository,
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
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
