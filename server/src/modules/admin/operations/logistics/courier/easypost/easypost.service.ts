import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class EasyPostService {
  private readonly logger = new Logger(EasyPostService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly settingsService: SettingsService,
    private readonly orderService: OrderService,
    private readonly cacheService: CacheService,
  ) {}

  private async getCredentials(ctx: RequestContextDto) {
    const tenantId = ctx.tenantId
    const cacheKey = `easypost:creds`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        let apiKey = this.configService.get<string>('EASYPOST_API_KEY')
        let mode = this.configService.get<string>('EASYPOST_MODE') || 'test'
        let originAddress = '123 Tech Boulevard'
        let originCity = 'San Francisco'
        let originState = 'CA'
        let originPostalCode = '94107'
        let originCountry = 'US'

        try {
          const settings = await this.settingsService.findByTenantSettings(ctx)
          if (settings?.shippingConfig) {
            if (settings.shippingConfig.easyPostApiKey) {
              apiKey = settings.shippingConfig.easyPostApiKey
            }
            if (settings.shippingConfig.easyPostMode) {
              mode = settings.shippingConfig.easyPostMode
            }
            if (settings.shippingConfig.originAddress) {
              originAddress = settings.shippingConfig.originAddress
              originCity = settings.shippingConfig.originCity || originCity
              originState = settings.shippingConfig.originState || originState
              originPostalCode = settings.shippingConfig.originPostalCode || originPostalCode
              originCountry = settings.shippingConfig.originCountry || originCountry
            }
          }
        } catch (error) {
          this.logger.warn('Failed to load settings, using defaults', error)
        }

        return { apiKey, mode, originAddress, originCity, originState, originPostalCode, originCountry }
      },
      600, // 10 minutes cache
      tenantId,
    )
  }

  /**
   * Estimates package dimensions and total weight volumetrically from variant logistics metadata.
   */
  calculateVolumetricParcel(items: any[]) {
    let totalWeight = 0
    let maxLength = 0
    let maxWidth = 0
    let totalHeight = 0

    for (const item of items) {
      const variant = item.variant || {}
      const quantity = Number(item.quantity) || 1

      const weight = Number(variant.weight ?? 1.0) // default 1.0 kg/lb
      const length = Number(variant.length ?? 5.0)  // default 5 inches/cm
      const width = Number(variant.width ?? 5.0)
      const height = Number(variant.height ?? 2.0)

      totalWeight += weight * quantity
      maxLength = Math.max(maxLength, length)
      maxWidth = Math.max(maxWidth, width)
      totalHeight += height * quantity
    }

    return {
      weight: parseFloat(totalWeight.toFixed(2)),
      length: parseFloat(maxLength.toFixed(2)) || 5.0,
      width: parseFloat(maxWidth.toFixed(2)) || 5.0,
      height: parseFloat(totalHeight.toFixed(2)) || 2.0,
    }
  }

  async getRates(toAddress: any, items: any[], ctx: RequestContextDto): Promise<any[]> {
    this.logger.log(`Fetching EasyPost shipping rates...`)
    const creds = await this.getCredentials(ctx)

    const isMock = !creds.apiKey || creds.apiKey.startsWith('easypost_mock') || process.env.NODE_ENV === 'test'

    if (isMock) {
      // Calculate parcel properties to adjust dynamic rate pricing mock simulation
      const parcel = this.calculateVolumetricParcel(items)
      const weightMultiplier = parcel.weight > 5 ? 2.5 : 1.0

      return [
        {
          id: 'rate_dhl_express',
          carrier: 'DHL',
          service: 'Express Worldwide',
          rate: parseFloat((25.0 * weightMultiplier).toFixed(2)),
          currency: 'USD',
          deliveryDays: 3,
        },
        {
          id: 'rate_fedex_priority',
          carrier: 'FedEx',
          service: 'International Priority',
          rate: parseFloat((18.5 * weightMultiplier).toFixed(2)),
          currency: 'USD',
          deliveryDays: 4,
        },
        {
          id: 'rate_usps_priority',
          carrier: 'USPS',
          service: 'Priority Mail International',
          rate: parseFloat((10.0 * weightMultiplier).toFixed(2)),
          currency: 'USD',
          deliveryDays: 7,
        },
      ]
    }

    try {
      const parcel = this.calculateVolumetricParcel(items)
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.easypost.com/v2/shipments',
          {
            shipment: {
              from_address: {
                street1: creds.originAddress,
                city: creds.originCity,
                state: creds.originState,
                zip: creds.originPostalCode,
                country: creds.originCountry,
              },
              to_address: {
                street1: toAddress.address,
                city: toAddress.city,
                state: toAddress.state,
                zip: toAddress.postalCode,
                country: toAddress.country,
                name: toAddress.recipientName,
                phone: toAddress.phone,
              },
              parcel: {
                weight: parcel.weight * 16, // EasyPost weight in ounces
                length: parcel.length,
                width: parcel.width,
                height: parcel.height,
              },
            },
          },
          {
            auth: {
              username: creds.apiKey,
              password: '',
            },
          },
        ),
      )

      const rates = response.data?.rates || []
      return rates.map((r: any) => ({
        id: r.id,
        carrier: r.carrier,
        service: r.service,
        rate: parseFloat(r.rate),
        currency: r.currency || 'USD',
        deliveryDays: r.delivery_days || 5,
      }))
    } catch (err: any) {
      this.logger.error('EasyPost rates API call failed', err.response?.data || err.message)
      throw new BadRequestException(`EasyPost error: ${err.response?.data?.error?.message || err.message}`)
    }
  }

  async createShipmentAndLabel(orderId: string, carrierCode: string, ctx: RequestContextDto): Promise<any> {
    this.logger.log(`Creating shipment and purchasing label in EasyPost for orderId: ${orderId}...`)
    const creds = await this.getCredentials(ctx)
    const order = await this.orderService.findOneForCourier(orderId, ctx)

    if (!order) {
      throw new Error('Order not found')
    }

    const isMock = !creds.apiKey || creds.apiKey.startsWith('easypost_mock') || process.env.NODE_ENV === 'test'

    const selectedCarrier = carrierCode || 'DHL'
    const trackingId = isMock ? `EZ${Date.now().toString().slice(-8)}` : `EZ${Date.now()}`

    if (isMock) {
      // Simulate label & customs generation
      const customsItems = order.items?.map((item: any) => ({
        description: item.product?.name || 'Order Item',
        quantity: item.quantity,
        value: item.unitPrice,
        weight: item.variant?.weight || 1.0,
        hs_code: item.variant?.hsCode || '8517.12.00',
        country_of_origin: item.variant?.countryOfOrigin || 'US',
      })) || []

      // Generate HTML printable URL representing CN22/CN23 Customs declaration + label
      const labelUrl = `https://api.easypost.com/mock/labels/${trackingId}.pdf`

      await this.orderService.updateOrder(
        order.id,
        {
          status: OrderStatus.SHIPPED,
          courierStatus: `${selectedCarrier} (Global)`,
          trackingId: trackingId,
        },
        ctx,
      )

      return {
        success: true,
        trackingCode: trackingId,
        carrier: selectedCarrier,
        labelUrl,
        customsDeclaration: {
          formType: 'CN22',
          customsCertify: true,
          customsSigner: order.customerName,
          items: customsItems,
        },
      }
    }

    try {
      const parcel = this.calculateVolumetricParcel(order.items || [])
      const destination = order.shippingAddress || {
        address: order.address,
        recipientName: order.customerName,
        phone: order.customerPhone,
      }

      // Create shipment with customs declaration
      const customsItems = (order.items || []).map((item: any) => ({
        description: (item.product?.name || 'Item').substring(0, 250),
        quantity: item.quantity,
        value: Number(item.unitPrice),
        weight: (Number(item.variant?.weight || 1.0) * 16), // ounces
        hs_code: item.variant?.hsCode || '8517.12.00',
        origin_country: item.variant?.countryOfOrigin || 'US',
      }))

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.easypost.com/v2/shipments',
          {
            shipment: {
              from_address: {
                street1: creds.originAddress,
                city: creds.originCity,
                state: creds.originState,
                zip: creds.originPostalCode,
                country: creds.originCountry,
              },
              to_address: {
                street1: destination.address,
                city: (destination as any).city || 'N/A',
                state: (destination as any).state || 'N/A',
                zip: (destination as any).postalCode || 'N/A',
                country: (destination as any).country || 'US',
                name: order.customerName,
                phone: order.customerPhone,
              },
              parcel: {
                weight: parcel.weight * 16,
                length: parcel.length,
                width: parcel.width,
                height: parcel.height,
              },
              customs_info: {
                customs_certify: 'true',
                customs_signer: 'Merchant Admin',
                contents_type: 'merchandise',
                contents_explanation: 'eCommerce Order Sale',
                restriction_type: 'none',
                non_delivery_option: 'return',
                customs_items: customsItems,
              },
            },
          },
          {
            auth: {
              username: creds.apiKey,
              password: '',
            },
          },
        ),
      )

      const shipment = response.data
      const rates = shipment.rates || []
      const lowestRate = rates.find((r: any) => r.carrier === selectedCarrier) || rates[0]

      if (!lowestRate) {
        throw new Error('No compatible shipping rates resolved for selected carrier.')
      }

      // Purchase the label
      const purchaseResponse = await firstValueFrom(
        this.httpService.post(
          `https://api.easypost.com/v2/shipments/${shipment.id}/buy`,
          {
            rate: { id: lowestRate.id },
          },
          {
            auth: {
              username: creds.apiKey,
              password: '',
            },
          },
        ),
      )

      const purchasedShipment = purchaseResponse.data
      const trackingCode = purchasedShipment.tracking_code
      const labelUrl = purchasedShipment.postage_label?.label_url

      await this.orderService.updateOrder(
        order.id,
        {
          status: OrderStatus.SHIPPED,
          courierStatus: `${selectedCarrier} (Global)`,
          trackingId: trackingCode,
        },
        ctx,
      )

      return {
        success: true,
        trackingCode,
        carrier: selectedCarrier,
        labelUrl,
      }
    } catch (err: any) {
      this.logger.error('EasyPost shipment purchase failed', err.response?.data || err.message)
      throw new BadRequestException(
        `EasyPost shipment error: ${err.response?.data?.error?.message || err.message}`,
      )
    }
  }

  async generateCommercialInvoice(orderId: string, ctx: RequestContextDto): Promise<string> {
    this.logger.log(`Generating Commercial Invoice for orderId: ${orderId}...`)
    const order = await this.orderService.findOneForCourier(orderId, ctx)
    const creds = await this.getCredentials(ctx)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    const dateStr = new Date(order.createdAt).toLocaleDateString()
    const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`

    let itemsSection = ''
    let totalWeight = 0

    order.items?.forEach((item: any, idx: number) => {
      const description = item.product?.name || 'Product Item'
      const qty = item.quantity
      const hs = item.variant?.hsCode || '8517.12.00'
      const origin = item.variant?.countryOfOrigin || 'US'
      const wt = Number(item.variant?.weight || 1.0)
      const subWt = wt * qty
      totalWeight += subWt
      const price = Number(item.unitPrice).toFixed(2)
      const total = (Number(item.unitPrice) * qty).toFixed(2)

      itemsSection += `
| ${idx + 1} | ${description.substring(0, 30).padEnd(30)} | ${qty.toString().padEnd(4)} | ${origin.padEnd(6)} | ${hs.padEnd(12)} | ${wt.toFixed(2).padEnd(6)} | ${price.padEnd(8)} | ${total.padEnd(8)} |`
    })

    return `
========================================================================
                      COMMERCIAL INVOICE & CUSTOMS DECLARATION
========================================================================
Invoice Number: ${invoiceNumber}                   Date: ${dateStr}
Order ID:       ${order.id}
Transaction ID: ${order.transactionId || 'N/A'}
------------------------------------------------------------------------
EXPORTER / SHIPPER:
Brand Name:   ${creds.originCity.toUpperCase()} EXPORT HUB
Address:      ${creds.originAddress}
City/State:   ${creds.originCity}, ${creds.originState} ${creds.originPostalCode}
Country:      ${creds.originCountry}

CONSIGNEE / RECIPIENT:
Customer:     ${order.customerName}
Phone:        ${order.customerPhone}
Address:      ${order.address}
------------------------------------------------------------------------
CURRENCY:     ${(order.currency || 'USD').toUpperCase()}
------------------------------------------------------------------------
Line | Item Description                | Qty  | Origin | HS Code      | Weight | Price    | Total    |
------------------------------------------------------------------------${itemsSection}
------------------------------------------------------------------------
TOTAL PACKAGE WEIGHT:   ${totalWeight.toFixed(2)} KG/LBS
SUBTOTAL AMOUNT:        ${(Number(order.totalAmount) - Number(order.shippingFee)).toFixed(2)} ${(order.currency || 'USD').toUpperCase()}
SHIPPING CHARGE:        ${Number(order.shippingFee).toFixed(2)} ${(order.currency || 'USD').toUpperCase()}
========================================================================
TOTAL ORDER VALUE:      ${Number(order.totalAmount).toFixed(2)} ${(order.currency || 'USD').toUpperCase()}
========================================================================
Declaration Statement:
I hereby certify that the information on this commercial invoice is true
and correct, and that the contents of this shipment are as declared.

Signed by Exporter: Authorized representative of ${order.tenantId.substring(0, 8)}
`
  }
}
