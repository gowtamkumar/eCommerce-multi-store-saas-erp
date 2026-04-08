import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { OrderService } from '@/modules/admin/sales/order/order.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { CreateSteadfastOrderDto } from '@/modules/admin/operations/logistics/courier/steadfast/dto/create-order.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

@Injectable()
export class SteadfastService {
  private readonly logger = new Logger(SteadfastService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly settingsService: SettingsService,
    private readonly orderService: OrderService,
    private readonly cacheService: CacheService,
  ) {}

  private async getCredentials(tenantId: string) {
    this.logger.log(`${this.getCredentials.name} Service Called`)
    const cacheKey = `steadfast:creds`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        let baseUrl = this.configService.get<string>('STEADFAST_BASE_URL')
        let apiKey = this.configService.get<string>('STEADFAST_API_KEY')
        let secretKey = this.configService.get<string>('STEADFAST_SECRET_KEY')

        try {
          const settings = await this.settingsService.findByTenantSettings(tenantId)
          if (settings?.steadfastCourier) {
            apiKey = settings.steadfastCourier.apiKey
            secretKey = settings.steadfastCourier.secretKey
          }
        } catch (error) {
          this.logger.warn('Failed to load settings, using defaults', error)
        }

        return { baseUrl, apiKey, secretKey }
      },
      600, // 10 minutes cache
      tenantId,
    )
  }

  async createSteadfastOrder(
    createOrderDto: CreateSteadfastOrderDto,
    tenantId: string,
  ): Promise<any> {
    this.logger.log(`${this.createSteadfastOrder.name} Service Called`)
    const { orderId } = createOrderDto
    const creds = await this.getCredentials(tenantId)

    const order = await this.orderService.findOneForCourier(orderId, tenantId)

    if (!order) {
        throw new Error('Order not found')
    }

    // Format phone number to ensure it's 11 digits starting with 0
    let formattedPhone = (order.customerPhone || '').replace(/\D/g, '')
    if (!formattedPhone.startsWith('0')) {
      formattedPhone = '0' + formattedPhone
    }
    if (formattedPhone.length > 11) {
      formattedPhone = formattedPhone.slice(0, 11)
    }

    if (formattedPhone.length < 11) {
      formattedPhone = '01700000000'
    }

    const steadfastOrderData = {
      invoice: order.id.slice(-8).toUpperCase(),
      recipient_name: order.customerName,
      recipient_phone: formattedPhone,
      recipient_address: order.address || 'Address not provided',
      cod_amount: Number(order.totalAmount) || 0,
      item_description:
        order.items
          ?.map((item: any) => `${item.quantity}x ${item.product?.name || 'Product'}`)
          .join(', ') || 'Order items',
    }

    try {
      const url = `${creds.baseUrl}/create_order`

      const response = await firstValueFrom(
        this.httpService.post(url, steadfastOrderData, {
          headers: {
            'Api-Key': creds.apiKey,
            'Secret-Key': creds.secretKey,
            'Content-Type': 'application/json',
          },
        }),
      )

      const responseData = response.data
      const trackingId = responseData.order?.tracking_code

      // Update order status to SHIPPED and save tracking info
      await this.orderService.updateOrder(
        order.id,
        {
          status: OrderStatus.SHIPPED,
          courierStatus: 'Steadfast',
          trackingId: trackingId?.toString(),
        },
        tenantId,
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to create Steadfast order', error.response?.data || error.message)
      throw error
    }
  }
}
