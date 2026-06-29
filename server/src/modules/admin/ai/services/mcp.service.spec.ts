import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { AdminCopilotToolService } from './admin-copilot-tool.service'
import { McpService } from './mcp.service'
import { McpAuthGuard } from '../guards/mcp-auth.guard'
import { UnauthorizedException, ExecutionContext } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken')

describe('MCP Authentication and Service', () => {
  let guard: McpAuthGuard
  let service: McpService
  let configService: ConfigService
  let userService: UserService

  const mockJwtSecret = 'test-secret-key-12345'
  const mockUser = {
    id: 'user-uuid-123',
    tenantId: 'tenant-uuid-456',
    email: 'test@example.com',
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

    it('should authorize a valid token and attach context to the request', async () => {
      mockRequest.query.token = 'valid-token'
      const mockDecoded = { sub: 'user-uuid-123', sessionId: 'session-uuid-789' }
      ;(jwt.verify as jest.Mock).mockReturnValue(mockDecoded)

      const result = await guard.canActivate(mockContext as ExecutionContext)

      expect(result).toBe(true)
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', mockJwtSecret)
      expect(userService.findUserById).toHaveBeenCalledWith('user-uuid-123')
      expect(mockRequest.user).toEqual({
        ...mockUser,
        sessionId: 'session-uuid-789',
      })
      expect(mockRequest.tenantId).toBe(mockUser.tenantId)
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
