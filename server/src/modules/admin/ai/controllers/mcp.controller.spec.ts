import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'
import { McpController } from './mcp.controller'
import { McpService } from '../services/mcp.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'

describe('McpController', () => {
  let controller: McpController
  let mcpService: McpService

  const mockCtx: RequestContextDto = {
    userId: 'user-uuid-123',
    storeId: 'store-uuid-456',
    branchId: null,
    warehouseId: null,
    user: { id: 'user-uuid-123', email: 'test@test.com' } as any,
  }

  const mockMcpService = {
    handleSseConnection: jest.fn(),
    handleIncomingMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpController],
      providers: [
        { provide: McpService, useValue: mockMcpService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
        {
          provide: UserService,
          useValue: { findUserById: jest.fn().mockResolvedValue({ id: 'test' }) },
        },
        {
          provide: RoleRepository,
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile()

    controller = module.get<McpController>(McpController)
    mcpService = module.get<McpService>(McpService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('establishSSE', () => {
    it('should call mcpService.handleSseConnection with req, res, ctx', async () => {
      const req = { query: { token: 'test-token' } } as any
      const res = { setHeader: jest.fn(), end: jest.fn() } as any

      await controller.establishSSE(req, res, mockCtx)

      expect(mockMcpService.handleSseConnection).toHaveBeenCalledWith(req, res, mockCtx)
    })
  })

  describe('handleMessages', () => {
    it('should call mcpService.handleIncomingMessage with req, res', async () => {
      const req = { query: { sessionId: 'test-session', token: 'test-token' } } as any
      const res = { setHeader: jest.fn(), end: jest.fn() } as any

      await controller.handleMessages(req, res)

      expect(mockMcpService.handleIncomingMessage).toHaveBeenCalledWith(req, res)
    })
  })
})
