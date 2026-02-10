import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { SettingsService } from '../../settings/settings.service'
import { CreatePathaoOrderDto } from './dto/create-order.dto'

@Injectable()
export class PathaoService {
  private readonly logger = new Logger(PathaoService.name)

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private settingsService: SettingsService,
  ) {}

  private async getAccessToken(credentials: any) {    
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

      console.log("response", response.data);
      
      return response.data.access_token
    } catch (error) {
      this.logger.error('Failed to authenticate with Pathao', error.response?.data || error.message)
      throw new Error(`Pathao Authentication failed: ${error.response?.data?.message || error.message}`)
    }
  }

  private async fetchCredentials(tenantId: string) {
    let baseURL: string
    let clientId: string
    let clientSecret: string
    let username: string
    let password: string
    let pathaoStoreId: number

    try {
      const settings = await this.settingsService.findByTenant(tenantId)
      
      if (settings?.pathaoCourier) {
        const courier = settings.pathaoCourier
        if (courier.pathaoClientId && courier.pathaoClientSecret && courier.pathaoUsername && courier.pathaoPassword) {
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

  async createOrder(createOrderDto: CreatePathaoOrderDto, tenantId: string) {
    const creds = await this.fetchCredentials(tenantId)
    const accessToken = await this.getAccessToken(creds)    

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${creds.baseURL}/aladdin/api/v1/orders`,
          {...createOrderDto, store_id: creds.pathaoStoreId},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        ),
      )
      this.logger.log('Pathao order created successfully', response.data)
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
