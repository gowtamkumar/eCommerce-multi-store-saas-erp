import { Test, TestingModule } from '@nestjs/testing'
import { ReturnService } from './return.service'
import { OrderReturnRepository } from '@/modules/admin/sales/order/repositories/order-return.repository'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { RefundMethod } from '@/common/enums/refund-method.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderReturnEntity } from '../entities/order-return.entity'
import { getQueueToken } from '@nestjs/bullmq'

describe('ReturnService', () => {
  let service: ReturnService
  let mockReturnRepository: any
  let mockAccountingQueue: any
  let mockCacheService: any

  const mockCtx: RequestContextDto = {
    tenantId: 'test-tenant',
    user: { id: 'user-1', username: 'testuser', role: 'admin' },
  } as any

  beforeEach(async () => {
    mockReturnRepository = {
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
    }
    mockAccountingQueue = {
      add: jest.fn().mockResolvedValue({}),
    }
    mockCacheService = {
      delCache: jest.fn(),
      delCacheByPattern: jest.fn(),
    }

    const mockOrderRepository = {}
    const mockInventoryLedgerService = {}
    const mockNotificationService = {}
    const mockWalletService = {}

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnService,
        {
          provide: OrderReturnRepository,
          useValue: mockReturnRepository,
        },
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
        {
          provide: InventoryLedgerService,
          useValue: mockInventoryLedgerService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: getQueueToken('accounting'),
          useValue: mockAccountingQueue,
        },
      ],
    }).compile()

    service = module.get<ReturnService>(ReturnService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateReturnRequestStatus - REFUNDED (CASH)', () => {
    it('should post a General Ledger entry for CASH refund', async () => {
      const returnRequest = {
        id: 'return-123',
        status: ReturnStatus.PENDING,
        refundAmount: 150,
        refundMethod: RefundMethod.CASH,
        order: { userId: 'customer-1' },
      } as any

      mockReturnRepository.findByIdWithRelations.mockResolvedValue(returnRequest)
      mockReturnRepository.updateStatus.mockResolvedValue({
        ...returnRequest,
        status: ReturnStatus.REFUNDED,
      })

      const result = await service.updateReturnRequestStatus(
        'return-123',
        mockCtx,
        ReturnStatus.REFUNDED,
        'Refund completed',
        RefundMethod.CASH,
      )

      expect(mockReturnRepository.findByIdWithRelations).toHaveBeenCalledWith(
        'return-123',
        'test-tenant',
      )
      expect(mockReturnRepository.updateStatus).toHaveBeenCalledWith(
        expect.objectContaining({ refundMethod: RefundMethod.CASH }),
        ReturnStatus.REFUNDED,
        'Refund completed',
      )
      expect(mockAccountingQueue.add).toHaveBeenCalledWith(
        'post-return-refund',
        {
          ctx: mockCtx,
          payload: {
            returnId: 'return-123',
            refundMethod: RefundMethod.CASH,
            refundAmount: 150,
          },
        },
        { removeOnComplete: true },
      )
      expect(mockCacheService.delCacheByPattern).toHaveBeenCalledWith('returns:all*', 'test-tenant')
      expect(result.status).toBe(ReturnStatus.REFUNDED)
    })
  })
})
