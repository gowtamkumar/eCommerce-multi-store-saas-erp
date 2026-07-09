import { Test, TestingModule } from '@nestjs/testing'
import { StockReservationService } from './stock-reservation.service'
import { InventoryLedgerService } from './inventory-ledger.service'
import { ReservationStatus } from '@/common/enums/reservation-status.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { StockReservationRepository } from './repositories/stock-reservation.repository'

describe('StockReservationService', () => {
  let service: StockReservationService
  let repoMock: any
  let ledgerServiceMock: any

  beforeEach(async () => {
    repoMock = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'res-id', ...entity })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      txRepo: jest.fn().mockImplementation((manager) => manager ? manager : repoMock),
      manager: {
        connection: {
          transaction: jest.fn().mockImplementation(async (cb) => {
            const mockManager = {
              findOne: jest.fn(),
              save: jest.fn().mockImplementation((cls, entity) => Promise.resolve(entity)),
            }
            return cb(mockManager)
          }),
        },
      },
    }

    ledgerServiceMock = {
      createLedgerEntry: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockReservationService,
        {
          provide: StockReservationRepository,
          useValue: repoMock,
        },
        {
          provide: InventoryLedgerService,
          useValue: ledgerServiceMock,
        },
      ],
    }).compile()

    service = module.get<StockReservationService>(StockReservationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('expireStale', () => {
    it('should sweep expired reservations and post RESERVATION_CANCEL ledger entries', async () => {
      const expiredRes = {
        id: 'expired-1',
        storeId: 'store-1',
        productId: 'prod-1',
        variantId: 'var-1',
        orderId: 'order-1',
        reservedQty: 10,
        fulfilledQty: 2,
        releasedQty: 0,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 10000),
      }

      const qbMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([expiredRes]),
      }

      repoMock.createQueryBuilder = jest.fn().mockReturnValue(qbMock)

      // Mock the transaction manager behaviour
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(expiredRes),
        save: jest.fn().mockImplementation((cls, entity) => {
          expect(entity.status).toBe(ReservationStatus.EXPIRED)
          expect(entity.releasedQty).toBe(8)
          return Promise.resolve(entity)
        }),
      }

      repoMock.manager.connection.transaction = jest.fn().mockImplementation(async (cb) => {
        return cb(mockManager)
      })

      const count = await service.expireStale()

      expect(count).toBe(1)
      expect(ledgerServiceMock.createLedgerEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 8,
          type: InventoryTransactionType.RESERVATION_CANCEL,
        }),
        expect.any(Object),
        mockManager,
      )
    })
  })
})
