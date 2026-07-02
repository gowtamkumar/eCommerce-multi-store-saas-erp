import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { StoreService } from '@/modules/system/store/store.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { ProductService } from '@/modules/admin/catalog/product/services/product.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { TrafficService } from './traffic.service'
import { SuperAdminService } from './super-admin.service'

describe('SuperAdminService', () => {
  let service: SuperAdminService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminService,
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: StoreService,
          useValue: {},
        },
        {
          provide: OrderService,
          useValue: {},
        },
        {
          provide: TrafficService,
          useValue: {},
        },
        {
          provide: ProductService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<SuperAdminService>(SuperAdminService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
