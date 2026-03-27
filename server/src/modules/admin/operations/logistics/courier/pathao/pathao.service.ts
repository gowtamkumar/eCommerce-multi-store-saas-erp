import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { OrderService } from '@/modules/admin/sales/order/order.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { CreatePathaoOrderDto } from '@/modules/admin/operations/logistics/courier/pathao/dto/create-order.dto'

@Injectable()
export class PathaoService {
  private readonly logger = new Logger(PathaoService.name)

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private settingsService: SettingsService,
    private orderService: OrderService,
  ) {}

  private async getAccessToken(credentials: any) {
    this.logger.log(`${this.getAccessToken.name} Service Called`)
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${credentials.baseURL}/aladdin/api/v1/issue-token`,
          {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            username: credentials.username,
            password: credentials.password,
            grant_type: 'password',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        ),
      )
      return response.data.access_token
    } catch (error) {
      this.logger.error('Failed to authenticate with Pathao', error.response?.data || error.message)
      throw new Error(
        `Pathao Authentication failed: ${error.response?.data?.message || error.message}`,
      )
    }
  }

  private async fetchCredentials(tenantId: string) {
    this.logger.log(`${this.fetchCredentials.name} Service Called`)
    let baseURL: string
    let clientId: string
    let clientSecret: string
    let username: string
    let password: string
    let pathaoStoreId: number

    try {
      const settings = await this.settingsService.findByTenantSettings(tenantId)

      if (settings?.pathaoCourier) {
        const courier = settings.pathaoCourier
        if (
          courier.pathaoClientId &&
          courier.pathaoClientSecret &&
          courier.pathaoUsername &&
          courier.pathaoPassword
        ) {
          baseURL = courier.sandboxMode
            ? this.configService.get<string>('PATHAO_SENDBOX_BASE_URL')
            : this.configService.get<string>('PATHAO_BASE_URL')

          clientId = courier.pathaoClientId
          clientSecret = courier.pathaoClientSecret
          username = courier.pathaoUsername
          password = courier.pathaoPassword
          pathaoStoreId = Number(settings.pathaoCourier.pathaoStoreId)
        }
      }
    } catch (error) {
      this.logger.warn('Failed to load settings, using environment variables', error)
    }

    if (!clientId || !clientSecret || !username || !password || !pathaoStoreId) {
      throw new Error('Pathao credentials are NOT configured.')
    }

    return { baseURL, clientId, clientSecret, username, password, pathaoStoreId }
  }

  async createPathaoOrder(createOrderDto: CreatePathaoOrderDto, tenantId: string) {
    this.logger.log(`${this.createPathaoOrder.name} Service Called`)
    const { orderId } = createOrderDto
    const creds = await this.fetchCredentials(tenantId)
    const accessToken = await this.getAccessToken(creds)

    const order: any = await this.orderService.findOneForCourier(orderId, tenantId)
    console.log('order', order)

    if (!order) {
      throw new Error('Order not found')
    }

    // Format phone number for Pathao
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

    // Calculate total item quantity and weight
    const totalQuantity =
      order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1
    const estimatedWeight = totalQuantity * 0.5 // Estimate 0.5kg per item

    // Map order data to Pathao format
    const pathaoOrderData = {
      store_id: creds.pathaoStoreId,
      merchant_order_id: order.id.slice(-8).toUpperCase(),
      recipient_name: order.customerName,
      recipient_phone: '01700000000',
      recipient_address: order.address || 'Address not provided',
      recipient_city: Number((order as any).cityId) || 1, // Dhaka = 1 (default to satisfy API)
      recipient_zone: Number((order as any).zoneId) || 1,
      recipient_area: Number((order as any).areaId) || 1,
      delivery_type: 48, // 48 for Normal Delivery, 12 for On Demand
      item_type: 2, // 1 for Document, 2 for Parcel
      item_quantity: totalQuantity,
      item_weight: Math.min(estimatedWeight, 10), // Max 10kg
      item_description:
        order.items
          ?.map((item: any) => `${item.quantity}x ${item.product?.name || 'Product'}`)
          .join(', ') || 'Order items',
      amount_to_collect: Number(order.totalAmount) || 0,
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${creds.baseURL}/aladdin/api/v1/orders`, pathaoOrderData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }),
      )
      const responseData = response.data
      const trackingId = responseData.data?.consignment_id

      // Update order status to SHIPPED and save tracking info
      await this.orderService.updateOrder(
        order.id,
        {
          status: OrderStatus.SHIPPED,
          courierStatus: 'Pathao',
          trackingId: trackingId?.toString(),
        },
        tenantId,
      )

      return response.data
    } catch (error) {
      this.logger.error('Failed to create Pathao order', error.response?.data || error.message)
      throw error
    }
  }

  // async getStores(tenantId: string) {
  //   const creds = await this.fetchCredentials(tenantId)
  //   const accessToken = await this.getAccessToken(creds)

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(
  //         `${creds.baseURL}/aladdin/api/v1/stores`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //             Accept: 'application/json',
  //           },
  //         },
  //       ),
  //     )
  //     return response.data
  //   } catch (error) {
  //     this.logger.error('Failed to fetch Pathao stores', error.response?.data || error.message)
  //     throw error
  //   }
  // }

  // async getCities(tenantId: string) {
  //   const creds = await this.fetchCredentials(tenantId)
  //   const accessToken = await this.getAccessToken(creds)

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(
  //         `${creds.baseURL}/aladdin/api/v1/countries/1/city-list`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //             Accept: 'application/json',
  //           },
  //         },
  //       ),
  //     )
  //     return response.data
  //   } catch (error) {
  //     this.logger.error('Failed to fetch Pathao cities', error.response?.data || error.message)
  //     throw error
  //   }
  // }

  // async getZones(cityId: number, tenantId: string) {
  //   const creds = await this.fetchCredentials(tenantId)
  //   const accessToken = await this.getAccessToken(creds)

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(
  //         `${creds.baseURL}/aladdin/api/v1/cities/${cityId}/zone-list`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //             Accept: 'application/json',
  //           },
  //         },
  //       ),
  //     )
  //     return response.data
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch Pathao zones for city ${cityId}`, error.response?.data || error.message)
  //     throw error
  //   }
  // }

  // async getAreas(zoneId: number, tenantId: string) {
  //   const creds = await this.fetchCredentials(tenantId)
  //   const accessToken = await this.getAccessToken(creds)

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(
  //         `${creds.baseURL}/aladdin/api/v1/zones/${zoneId}/area-list`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`,
  //             Accept: 'application/json',
  //           },
  //         },
  //       ),
  //     )
  //     return response.data
  //   } catch (error) {
  //     this.logger.error(`Failed to fetch Pathao areas for zone ${zoneId}`, error.response?.data || error.message)
  //     throw error
  //   }
  // }
}
