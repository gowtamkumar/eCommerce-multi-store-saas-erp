import { Test, TestingModule } from '@nestjs/testing'
import { FulfillmentService } from './fulfillment.service'
import { FulfillmentRepository } from './fulfillment.repository'
import { InventoryLedgerService } from '../inventory-transaction/inventory-ledger.service'
import { StockReservationService } from '../inventory-transaction/stock-reservation.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { DataSource } from 'typeorm'
import { FulfillmentStatus } from './enums/fulfillment-status.enum'
import { ReservationStatus } from '@/common/enums/reservation-status.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { StockReservationEntity } from '../inventory-transaction/entities/stock-reservation.entity'

describe('FulfillmentService', () => {
  let service: FulfillmentService
  let repoMock: any
  let ledgerServiceMock: any
  let reservationServiceMock: any
  let orderRepoMock: any
  let dataSourceMock: any

  beforeEach(async () => {
    repoMock = {
      findTaskById: jest.fn(),
      updateTask: jest.fn(),
      updateItem: jest.fn(),
    }

    ledgerServiceMock = {
      createLedgerEntry: jest.fn(),
    }

    reservationServiceMock = {
      fulfill: jest.fn(),
    }

    orderRepoMock = {
      findOne: jest.fn(),
      update: jest.fn(),
    }

    dataSourceMock = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const mockManager = {
          findOne: jest.fn(),
          update: jest.fn(),
        }
        return cb(mockManager)
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FulfillmentService,
        {
          provide: FulfillmentRepository,
          useValue: repoMock,
        },
        {
          provide: InventoryLedgerService,
          useValue: ledgerServiceMock,
        },
        {
          provide: StockReservationService,
          useValue: reservationServiceMock,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: orderRepoMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile()

    service = module.get<FulfillmentService>(FulfillmentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('shipOrder', () => {
    it('should ship order, fulfill active stock reservation, and write RESERVATION_CANCEL and SALE ledger entries', async () => {
      const task = {
        id: 'task-1',
        orderId: 'order-1',
        warehouseId: 'wh-1',
        status: FulfillmentStatus.PACKED,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 5,
          },
        ],
      }

      repoMock.findTaskById.mockResolvedValue(task)

      const reservation = {
        id: 'res-1',
        status: ReservationStatus.ACTIVE,
      }

      // Mock the transaction manager's operations
      const mockManager = {
        findOne: jest.fn().mockImplementation((entityClass, options) => {
          if (entityClass === StockReservationEntity) {
            return Promise.resolve(reservation)
          }
          return Promise.resolve(null)
        }),
        update: jest.fn().mockResolvedValue(null),
      }

      dataSourceMock.transaction.mockImplementation(async (cb) => {
        return cb(mockManager)
      })

      const ctx = { tenantId: 'tenant-1', userId: 'user-1' } as any
      await service.shipOrder('task-1', ctx)

      // Verify reservation was fulfilled
      expect(reservationServiceMock.fulfill).toHaveBeenCalledWith(
        'res-1',
        5,
        ctx,
        mockManager,
        'wh-1',
      )

      // Verify RESERVATION_CANCEL ledger entry is written
      expect(ledgerServiceMock.createLedgerEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 5,
          type: InventoryTransactionType.RESERVATION_CANCEL,
          referenceId: 'order-1',
          warehouseId: 'wh-1',
        }),
        ctx,
        mockManager,
      )

      // Verify SALE ledger entry is written
      expect(ledgerServiceMock.createLedgerEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 5,
          type: InventoryTransactionType.SALE,
          referenceId: 'order-1',
          warehouseId: 'wh-1',
        }),
        ctx,
        mockManager,
      )
    })
  })
})
