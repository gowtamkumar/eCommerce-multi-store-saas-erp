import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { OrderRepository } from '@/modules/admin/sales/order/repositories/order.repository'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PaymentRepository } from '../repositories/payment.repository'
import { PaymentService } from './payment.service'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('PaymentService', () => {
  let service: PaymentService
  let orderRepository: any

  beforeEach(async () => {
    orderRepository = {
      findOrderById: jest.fn(),
      saveOrder: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: OrderRepository,
          useValue: orderRepository,
        },
        {
          provide: PaymentRepository,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: {},
        },
        {
          provide: InvoiceService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: AuditLogService,
          useValue: {},
        },
        {
          provide: NotificationService,
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

    service = module.get<PaymentService>(PaymentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validatePaymentMethodForCurrency', () => {
    it('should pass for SSLCOMMERZ with BDT currency', () => {
      expect(() => {
        service.validatePaymentMethodForCurrency(PaymentMethod.SSLCOMMERZ, 'BDT')
      }).not.toThrow()
    })

    it('should throw BadRequestException for SSLCOMMERZ with non-BDT currency', () => {
      expect(() => {
        service.validatePaymentMethodForCurrency(PaymentMethod.SSLCOMMERZ, 'USD')
      }).toThrow(BadRequestException)
    })

    it('should pass for STRIPE and PAYPAL with non-BDT currency', () => {
      expect(() => {
        service.validatePaymentMethodForCurrency(PaymentMethod.STRIPE, 'USD')
        service.validatePaymentMethodForCurrency(PaymentMethod.PAYPAL, 'EUR')
      }).not.toThrow()
    })

    it('should throw BadRequestException for STRIPE and PAYPAL with BDT currency', () => {
      expect(() => {
        service.validatePaymentMethodForCurrency(PaymentMethod.STRIPE, 'BDT')
      }).toThrow(BadRequestException)

      expect(() => {
        service.validatePaymentMethodForCurrency(PaymentMethod.PAYPAL, 'BDT')
      }).toThrow(BadRequestException)
    })
  })

  describe('initPayment validation', () => {
    it('should throw NotFoundException if order is not found', async () => {
      orderRepository.findOrderById.mockResolvedValue(null)
      const dto = { orderId: 'nonexistent-id', callbackUrl: 'http://localhost:3000/callback' }
      const ctx = { storeId: 'store-1' } as any

      await expect(service.initPayment(dto, ctx)).rejects.toThrow(NotFoundException)
    })

    it('should validate payment method / currency before initiating', async () => {
      orderRepository.findOrderById.mockResolvedValue({
        id: 'order-1',
        paymentMethod: PaymentMethod.SSLCOMMERZ,
        currency: 'USD', // Invalid for SSLCommerz
      })

      const dto = { orderId: 'order-1', callbackUrl: 'http://localhost:3000/callback' }
      const ctx = { storeId: 'store-1' } as any

      await expect(service.initPayment(dto, ctx)).rejects.toThrow(BadRequestException)
      await expect(service.initPayment(dto, ctx)).rejects.toThrow('SSLCommerz only supports BDT')
    })
  })
})
