import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { UserRepository } from '../repositories/user.repository'
import { StaffInvitationService } from './staff-invitation.service'
import { UserService } from './user.service'
import { PermissionRepository } from '../repositories/permission.repository'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: StaffInvitationService,
          useValue: {},
        },
        {
          provide: PermissionRepository,
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

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
