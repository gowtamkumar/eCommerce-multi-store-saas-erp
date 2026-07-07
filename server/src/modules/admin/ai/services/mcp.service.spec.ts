import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'
import { AdminCopilotToolService } from './admin-copilot-tool.service'
import { McpService } from './mcp.service'
import { McpAuthGuard } from '../guards/mcp-auth.guard'
import { ForbiddenException, UnauthorizedException, ExecutionContext } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'

jest.mock('jsonwebtoken')

const mockRoleWithAiUse = {
  id: 'role-uuid-1',
  permissions: [{ code: SystemPermissions.AI_USE }],
}

const mockRoleWithoutAiUse = {
  id: 'role-uuid-2',
  permissions: [{ code: 'orders:read' }],
}

describe('MCP Authentication and Service', () => {
  let guard: McpAuthGuard
  let service: McpService
  let configService: ConfigService
  let userService: UserService
  let roleRepository: RoleRepository

  const mockJwtSecret = 'test-secret-key-12345'
  const mockUser = {
    id: 'user-uuid-123',
    storeId: 'store-uuid-456',
    email: 'test@example.com',
    isAdmin: false,
    role: UserRole.USER,
    roleId: 'role-uuid-1',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        McpAuthGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET_KEY') return mockJwtSecret
              return null
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AdminCopilotToolService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<McpService>(McpService)
    guard = module.get<McpAuthGuard>(McpAuthGuard)
    configService = module.get<ConfigService>(ConfigService)
    userService = module.get<UserService>(UserService)
    roleRepository = module.get<RoleRepository>(RoleRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('McpAuthGuard', () => {
    let mockContext: Partial<ExecutionContext>
    let mockRequest: any

    beforeEach(() => {
      mockRequest = {
        query: {},
        headers: {},
      }
      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => ({}),
          getNext: () => ({}),
        }),
      } as any
    })

    it('should authorize a valid token with ai:use permission', async () => {
      mockRequest.query.token = 'valid-token'
      const mockDecoded = { sub: 'user-uuid-123', sessionId: 'session-uuid-789' }
      ;(jwt.verify as jest.Mock).mockReturnValue(mockDecoded)
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRoleWithAiUse as any)

      const result = await guard.canActivate(mockContext as ExecutionContext)

      expect(result).toBe(true)
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', mockJwtSecret)
      expect(userService.findUserById).toHaveBeenCalledWith('user-uuid-123')
      expect(mockRequest.user).toEqual(expect.objectContaining({
        ...mockUser,
        sessionId: 'session-uuid-789',
      }))
      expect(mockRequest.storeId).toBe(mockUser.storeId)
    })

    it('should authorize super admin without role permission check', async () => {
      mockRequest.query.token = 'admin-token'
      const mockDecoded = { sub: 'admin-uuid' }
      ;(jwt.verify as jest.Mock).mockReturnValue(mockDecoded)
      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        ...mockUser,
        id: 'admin-uuid',
        isAdmin: true,
        role: UserRole.SUPER_ADMIN,
      } as any)

      const result = await guard.canActivate(mockContext as ExecutionContext)

      expect(result).toBe(true)
      expect(roleRepository.findOne).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException if user lacks ai:use permission', async () => {
      mockRequest.query.token = 'no-perm-token'
      const mockDecoded = { sub: 'no-perm-user' }
      ;(jwt.verify as jest.Mock).mockReturnValue(mockDecoded)
      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        ...mockUser,
        id: 'no-perm-user',
        isAdmin: false,
        role: UserRole.USER,
        roleId: 'role-uuid-2',
      } as any)
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRoleWithoutAiUse as any)

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw ForbiddenException if user has no role assigned', async () => {
      mockRequest.query.token = 'no-role-token'
      const mockDecoded = { sub: 'no-role-user' }
      ;(jwt.verify as jest.Mock).mockReturnValue(mockDecoded)
      jest.spyOn(userService, 'findUserById').mockResolvedValue({
        ...mockUser,
        id: 'no-role-user',
        isAdmin: false,
        role: UserRole.USER,
        roleId: null,
      } as any)

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw UnauthorizedException if token is missing', async () => {
      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException if token signature is invalid', async () => {
      mockRequest.query.token = 'invalid-token'
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('McpService', () => {
    it('should construct and initialize correctly', () => {
      expect(service).toBeDefined()
    })
  })
})
