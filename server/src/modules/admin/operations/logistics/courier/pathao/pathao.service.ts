import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { CreatePathaoOrderDto } from '@/modules/admin/operations/logistics/courier/pathao/dto/create-order.dto'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class PathaoService {
  private readonly logger = new Logger(PathaoService.name)

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private settingsService: SettingsService,
    private orderService: OrderService,
    private cacheService: CacheService,
  ) {}

  /**
   * Internal helper to get authenticated credentials for Pathao API calls.
   * Leverages caching to minimize redundant setting lookups and token issuance.
   */
  private async getAuthenticatedClient(ctx: RequestContextDto) {
    this.logger.log(`${this.getAuthenticatedClient.name} Called for store: ${ctx.storeId}`)
    const storeId = ctx.storeId

    // 1. Fetch & Cache Credentials
    const creds = await this.cacheService.rememberCache(
      `pathao:creds`,
      async () => {
        const settings = await this.settingsService.findByStoreSettings(ctx)
        const courier = settings?.pathaoCourier

        if (
          !courier?.pathaoClientId ||
          !courier?.pathaoClientSecret ||
          !courier?.pathaoUsername ||
          !courier?.pathaoPassword ||
          !courier?.pathaoStoreId
        ) {
          throw new Error('Pathao configuration is incomplete.')
        }

        return {
          baseURL: courier.sandboxMode
            ? this.configService.get<string>('PATHAO_SENDBOX_BASE_URL')
            : this.configService.get<string>('PATHAO_BASE_URL'),
          clientId: courier.pathaoClientId,
          clientSecret: courier.pathaoClientSecret,
          username: courier.pathaoUsername,
          password: courier.pathaoPassword,
          pathaoStoreId: Number(courier.pathaoStoreId),
        }
      },
      600,
      storeId,
    )

    // 2. Fetch & Cache Access Token
    const accessToken = await this.cacheService.rememberCache(
      `pathao:token`,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.post(
              `${creds.baseURL}/aladdin/api/v1/issue-token`,
              {
                client_id: creds.clientId,
                client_secret: creds.clientSecret,
                username: creds.username,
                password: creds.password,
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
        } catch (error: any) {
          this.logger.error('Pathao token exchange failed', error.response?.data || error.message)
          const errorMsg =
            error.response?.data?.message ||
            (typeof error.response?.data === 'string' ? error.response.data : null) ||
            error.response?.data?.error ||
            error.message
          throw new BadRequestException(`Pathao Authentication failed: ${errorMsg}`)
        }
      },
      3600,
      storeId,
    )

    return { baseURL: creds.baseURL, accessToken, storeId: creds.pathaoStoreId }
  }

  async createPathaoOrder(
    createOrderDto: CreatePathaoOrderDto,
    ctx: RequestContextDto,
  ): Promise<any> {
    this.logger.log(`${this.createPathaoOrder.name} Service Called`)
    const { orderId } = createOrderDto
    const client = await this.getAuthenticatedClient(ctx)
    const storeId = ctx.storeId

    const order: any = await this.orderService.findOneForCourier(orderId, ctx)

    if (!order) {
      throw new Error('Order not found')
    }

    // Map order data to Pathao format
    const pathaoOrderData = {
      store_id: client.storeId,
      merchant_order_id: order.id.slice(-8).toUpperCase(),
      recipient_name: order.customerName,
      recipient_phone: order.customerPhone || '01700000000',
      recipient_address: order.address || 'Address not provided',
      recipient_city: Number(createOrderDto.recipient_city || (order as any).cityId || 1),
      recipient_zone: Number(createOrderDto.recipient_zone || (order as any).zoneId || 1),
      recipient_area: Number(createOrderDto.recipient_area || (order as any).areaId || 1),
      delivery_type: 48,
      item_type: 2,
      item_quantity:
        order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1,
      item_weight: Number(createOrderDto.item_weight || 0.5),
      item_description:
        order.items
          ?.map((item: any) => `${item.quantity}x ${item.product?.name || 'Product'}`)
          .join(', ') || 'Order items',
      amount_to_collect: Number(order.totalAmount) || 0,
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${client.baseURL}/aladdin/api/v1/orders`, pathaoOrderData, {
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }),
      )
      const responseData = response.data
      const trackingId = responseData.data?.consignment_id

      await this.orderService.updateOrder(
        order.id,
        {
          status: OrderStatus.SHIPPED,
          courierStatus: 'Pathao',
          trackingId: trackingId?.toString(),
        },
        ctx,
      )

      return response.data
    } catch (error: any) {
      this.logger.error('Failed to create Pathao order', error.response?.data || error.message)
      const errorMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.response?.data?.error ||
        error.message
      throw new BadRequestException(`Pathao: ${errorMsg}`)
    }
  }

  async getCities(ctx: RequestContextDto) {
    this.logger.log(`${this.getCities.name} Service Called`)
    const client = await this.getAuthenticatedClient(ctx)
    const storeId = ctx.storeId
    const cacheKey = `pathao:cities`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${client.baseURL}/aladdin/api/v1/countries/1/city-list`, {
              headers: {
                Authorization: `Bearer ${client.accessToken}`,
                Accept: 'application/json',
              },
            }),
          )
          return response.data
        } catch (error: any) {
          this.logger.error('Failed to fetch Pathao cities', error.response?.data || error.message)
          const errorMsg =
            error.response?.data?.message ||
            (typeof error.response?.data === 'string' ? error.response.data : null) ||
            error.response?.data?.error ||
            error.message
          throw new BadRequestException(`Pathao: ${errorMsg}`)
        }
      },
      86400, // 24 hours
      storeId,
    )
  }

  async getZones(cityId: number, ctx: RequestContextDto) {
    this.logger.log(`${this.getZones.name} Service Called`)
    const client = await this.getAuthenticatedClient(ctx)
    const storeId = ctx.storeId
    const cacheKey = `pathao:zones:${cityId}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${client.baseURL}/aladdin/api/v1/cities/${cityId}/zone-list`, {
              headers: {
                Authorization: `Bearer ${client.accessToken}`,
                Accept: 'application/json',
              },
            }),
          )
          return response.data
        } catch (error: any) {
          this.logger.error(
            `Failed to fetch Pathao zones for city ${cityId}`,
            error.response?.data || error.message,
          )
          const errorMsg =
            error.response?.data?.message ||
            (typeof error.response?.data === 'string' ? error.response.data : null) ||
            error.response?.data?.error ||
            error.message
          throw new BadRequestException(`Pathao: ${errorMsg}`)
        }
      },
      86400,
      storeId,
    )
  }

  async getAreas(zoneId: number, ctx: RequestContextDto) {
    this.logger.log(`${this.getAreas.name} Service Called`)
    const client = await this.getAuthenticatedClient(ctx)
    const storeId = ctx.storeId
    const cacheKey = `pathao:areas:${zoneId}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${client.baseURL}/aladdin/api/v1/zones/${zoneId}/area-list`, {
              headers: {
                Authorization: `Bearer ${client.accessToken}`,
                Accept: 'application/json',
              },
            }),
          )
          return response.data
        } catch (error: any) {
          this.logger.error(
            `Failed to fetch Pathao areas for zone ${zoneId}`,
            error.response?.data || error.message,
          )
          const errorMsg =
            error.response?.data?.message ||
            (typeof error.response?.data === 'string' ? error.response.data : null) ||
            error.response?.data?.error ||
            error.message
          throw new BadRequestException(`Pathao: ${errorMsg}`)
        }
      },
      86400,
      storeId,
    )
  }

  async calculatePathaoPrice(data: any, ctx: RequestContextDto): Promise<any> {
    this.logger.log(`${this.calculatePathaoPrice.name} Service Called`)
    const client = await this.getAuthenticatedClient(ctx)
    const payload = {
      store_id: client.storeId,
      item_type: Number(data.itemType || 2),
      delivery_type: Number(data.deliveryType || 48),
      item_weight: Number(data.itemWeight || 0.5),
      recipient_city: Number(data.recipientCity),
      recipient_zone: Number(data.recipientZone),
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${client.baseURL}/aladdin/api/v1/merchant/price-calculation`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${client.accessToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        ),
      )
      return response.data
    } catch (error: any) {
      this.logger.error('Failed to calculate Pathao price', error.response?.data || error.message)
      const errorMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.response?.data?.error ||
        error.message
      throw new BadRequestException(`Pathao: ${errorMsg}`)
    }
  }

  async getPathaoStatus(trackingCode: string, ctx: RequestContextDto): Promise<any> {
    this.logger.log(`${this.getPathaoStatus.name} Service Called for trackingCode: ${trackingCode}`)
    const client = await this.getAuthenticatedClient(ctx)
    const url = `${client.baseURL}/aladdin/api/v1/orders/${trackingCode}/tracking`

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${client.accessToken}`,
            Accept: 'application/json',
          },
        }),
      )
      return response.data
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch Pathao status for trackingCode ${trackingCode}`,
        error.response?.data || error.message,
      )
      const errorMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        error.response?.data?.error ||
        error.message
      throw new BadRequestException(`Pathao: ${errorMsg}`)
    }
  }
}
