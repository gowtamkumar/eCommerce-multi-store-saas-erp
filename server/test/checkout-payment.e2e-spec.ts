import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { ShippingAddressEntity } from '@/modules/store/shipping-address/entities/shipping-address.entity'
import { PaymentService } from '@/modules/admin/sales/payment/services/payment.service'
import { PaymentStrategyFactory } from '@/common/strategies/payment/payment-strategy.factory'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

describe('Checkout and Payment Gateway (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let paymentService: PaymentService
  let store: StoreEntity
  let ctx: RequestContextDto

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    paymentService = app.get(PaymentService)

    // Create a mock store for testing
    const storeRepo = dataSource.getRepository(StoreEntity)
    store = storeRepo.create({
      storeName: 'E2E Test Payment Store',
      subdomain: `e2e-test-pay-${Date.now()}`,
    })
    await storeRepo.save(store)

    // Create a mock user to satisfy foreign key constraints
    const userRepo = dataSource.getRepository(UserEntity)
    const user = userRepo.create({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'E2E Test User',
      username: `e2etestuser-${Date.now()}`,
      password: 'password',
      storeId: store.id,
    })
    await userRepo.save(user)

    ctx = new RequestContextDto()
    ctx.storeId = store.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'
  })

  afterAll(async () => {
    if (store) {
      const tables = [
        'payments',
        'order_items',
        'orders',
        'shipping_addresses',
        'site_settings',
        'users',
      ]
      for (const table of tables) {
        try {
          await dataSource.query(`DELETE FROM "${table}" WHERE "store_id" = $1`, [store.id])
        } catch (e) {
          // Ignore table deletion errors to continue cleanup
        }
      }
      const storeRepo = dataSource.getRepository(StoreEntity)
      await storeRepo.delete(store.id)
    }
    if (app) {
      await app.close()
    }
  })

  describe('Global Address & Phone Validation', () => {
    it('should successfully create a shipping address with global fields and relaxed phone formats', async () => {
      const addrRepo = dataSource.getRepository(ShippingAddressEntity)

      const addresses = [
        {
          recipientName: 'US Customer',
          phone: '+1 555-0199',
          address: '1600 Amphitheatre Pkwy',
          city: 'Mountain View',
          state: 'California',
          postalCode: '94043',
          country: 'US',
          isDefault: true,
          storeId: store.id,
          userId: ctx.userId,
        },
        {
          recipientName: 'UK Customer',
          phone: '+44 20 7946 0958',
          address: '10 Downing Street',
          city: 'London',
          state: 'England',
          postalCode: 'SW1A 2AA',
          country: 'GB',
          isDefault: false,
          storeId: store.id,
          userId: ctx.userId,
        },
      ]

      for (const data of addresses) {
        const addr = addrRepo.create(data)
        const saved = await addrRepo.save(addr)
        expect(saved).toBeDefined()
        expect(saved.id).toBeDefined()
        expect(saved.phone).toBe(data.phone)
        expect(saved.country).toBe(data.country)
        expect(saved.state).toBe(data.state)
        expect(saved.postalCode).toBe(data.postalCode)
      }
    })
  })

  describe('Payment Strategy Factory & Initiation', () => {
    it('should instantiate and resolve Stripe and PayPal payment strategies', () => {
      const stripeStrategy = PaymentStrategyFactory.create(PaymentMethod.STRIPE)
      const paypalStrategy = PaymentStrategyFactory.create(PaymentMethod.PAYPAL)

      expect(stripeStrategy).toBeDefined()
      expect(paypalStrategy).toBeDefined()
      expect(stripeStrategy.constructor.name).toBe('StripePaymentStrategy')
      expect(paypalStrategy.constructor.name).toBe('PaypalPaymentStrategy')
    })

    it('should successfully initiate simulated Stripe payment', async () => {
      const orderRepo = dataSource.getRepository(OrderEntity)
      const order = orderRepo.create({
        customerName: 'Stripe Cust',
        customerPhone: '+15550199',
        customerEmail: 'stripe@test.com',
        address: '1600 Amphitheatre Pkwy, Mountain View, California, 94043, US',
        totalAmount: 1500,
        currency: 'USD',
        currencyRate: 1,
        paymentMethod: PaymentMethod.STRIPE,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        storeId: store.id,
        userId: ctx.userId,
      })
      await orderRepo.save(order)

      const res = await paymentService.initPayment({
        orderId: order.id,
        callbackUrl: 'http://localhost:3000/api/payment',
      }, ctx)

      expect(res.gatewayUrl.toLowerCase()).toContain('stripe')
      expect(res.gatewayUrl.toLowerCase()).toContain('mock_session')
    })

    it('should successfully initiate simulated PayPal payment', async () => {
      const orderRepo = dataSource.getRepository(OrderEntity)
      const order = orderRepo.create({
        customerName: 'PayPal Cust',
        customerPhone: '+442079460958',
        customerEmail: 'paypal@test.com',
        address: '10 Downing Street, London, England, SW1A 2AA, GB',
        totalAmount: 2000,
        currency: 'USD',
        currencyRate: 1,
        paymentMethod: PaymentMethod.PAYPAL,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        storeId: store.id,
        userId: ctx.userId,
      })
      await orderRepo.save(order)

      const res = await paymentService.initPayment({
        orderId: order.id,
        callbackUrl: 'http://localhost:3000/api/payment',
      }, ctx)

      expect(res.gatewayUrl.toLowerCase()).toContain('paypal')
      expect(res.gatewayUrl.toLowerCase()).toContain('mock_token')
    })
  })

  describe('Stripe & PayPal Callback Validation', () => {
    it('should process Stripe success callback successfully', async () => {
      const orderRepo = dataSource.getRepository(OrderEntity)
      const order = await orderRepo.findOneBy({
        customerEmail: 'stripe@test.com',
        storeId: store.id,
      })
      expect(order).toBeDefined()

      await paymentService.handleSuccessPayment(order.transactionId, {
        session_id: 'mock_session_123',
        tran_id: order.transactionId,
      })

      const updatedOrder = await orderRepo.findOneBy({ id: order.id })
      expect(updatedOrder.paymentStatus).toBe(PaymentStatus.PAID)
    })

    it('should process PayPal success callback successfully', async () => {
      const orderRepo = dataSource.getRepository(OrderEntity)
      const order = await orderRepo.findOneBy({
        customerEmail: 'paypal@test.com',
        storeId: store.id,
      })
      expect(order).toBeDefined()

      await paymentService.handleSuccessPayment(order.transactionId, {
        token: 'mock_token_123',
        tran_id: order.transactionId,
      })

      const updatedOrder = await orderRepo.findOneBy({ id: order.id })
      expect(updatedOrder.paymentStatus).toBe(PaymentStatus.PAID)
    })
  })
})
