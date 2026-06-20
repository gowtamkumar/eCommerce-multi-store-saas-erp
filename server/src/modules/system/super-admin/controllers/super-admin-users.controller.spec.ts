import { Test, TestingModule } from '@nestjs/testing'
import { SuperAdminUsersController } from './super-admin-users.controller'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { SuperAdminCrossTenantRepository } from '../repositories/super-admin-cross-tenant.repository'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'

describe('SuperAdminUsersController', () => {
  let controller: SuperAdminUsersController
  let userService: jest.Mocked<UserService>
  let mailService: jest.Mocked<MailService>

  beforeEach(async () => {
    const mockUserService = {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    }
    const mockMailService = {
      sendVerificationEmail: jest.fn(),
    }
    const mockCrossTenantRepo = {}

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminUsersController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: SuperAdminCrossTenantRepository,
          useValue: mockCrossTenantRepo,
        },
      ],
    }).compile()

    controller = module.get<SuperAdminUsersController>(SuperAdminUsersController)
    userService = module.get(UserService)
    mailService = module.get(MailService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('sendVerificationEmail', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      userService.getUser.mockResolvedValue(null)

      await expect(controller.sendVerificationEmail('non-existent')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw BadRequestException if user has no email', async () => {
      userService.getUser.mockResolvedValue({ id: '1', email: null } as any)

      await expect(controller.sendVerificationEmail('1')).rejects.toThrow(BadRequestException)
    })

    it('should generate a token, update user, and send verification email if token does not exist', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        emailVerificationToken: null,
      }
      userService.getUser.mockResolvedValue(mockUser as any)
      userService.updateUser.mockResolvedValue({} as any)
      mailService.sendVerificationEmail.mockResolvedValue(undefined)

      const result = await controller.sendVerificationEmail('1')

      expect(userService.updateUser).toHaveBeenCalledWith('1', {
        emailVerificationToken: expect.any(String),
      })
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
        'tenant-123',
      )
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Verification email sent successfully',
        data: null,
      })
    })

    it('should reuse existing token and send verification email if token exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        emailVerificationToken: 'existing-token-xyz',
      }
      userService.getUser.mockResolvedValue(mockUser as any)
      mailService.sendVerificationEmail.mockResolvedValue(undefined)

      const result = await controller.sendVerificationEmail('1')

      expect(userService.updateUser).not.toHaveBeenCalled()
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'existing-token-xyz',
        'tenant-123',
      )
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Verification email sent successfully',
        data: null,
      })
    })

    it('should throw InternalServerErrorException if mail sending fails', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        emailVerificationToken: 'token',
      }
      userService.getUser.mockResolvedValue(mockUser as any)
      mailService.sendVerificationEmail.mockRejectedValue(new Error('SMTP connection timed out'))

      await expect(controller.sendVerificationEmail('1')).rejects.toThrow(
        InternalServerErrorException,
      )
    })
  })
})
