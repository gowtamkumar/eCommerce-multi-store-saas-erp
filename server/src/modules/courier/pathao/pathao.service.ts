import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PathaoApiService } from 'pathao-merchant-sdk'
import { SettingsService } from '../../settings/settings.service'
import { CreatePathaoOrderDto } from './dto/create-order.dto'

@Injectable()
export class PathaoService {
  private readonly logger = new Logger(PathaoService.name)

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {}

  private getClient(config: any) {
    return new PathaoApiService({
      baseURL: config.baseURL,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      username: config.username,
      password: config.password,
      timeout: 10000,
    })
  }

  async createOrder(createOrderDto: CreatePathaoOrderDto, tenantId: string) {
    // let baseURL = this.configService.get<string>('PATHAO_BASE_URL')
    // let clientId = this.configService.get<string>('PATHAO_CLIENT_ID')
    // let clientSecret = this.configService.get<string>('PATHAO_CLIENT_SECRET')
    // let username = this.configService.get<string>('PATHAO_USERNAME')
    // let password = this.configService.get<string>('PATHAO_PASSWORD')

    console.log("createOrderDto", createOrderDto);
    

    let baseURL = ''
    let clientId = ''
    let clientSecret = ''
    let username = ''
    let password = ''

    try {
      const settings = await this.settingsService.findByTenant(tenantId)
      console.log("settings", settings);
      
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
        }
      }
    } catch (error) {
      this.logger.warn('Failed to load settings, using environment variables', error)
    }

    const credentials = {
      baseURL,
      clientId,
      clientSecret,
      username,
      password,
    }

    if (!clientId || !clientSecret || !username || !password) {
       this.logger.warn('Pathao credentials are missing.')
       throw new Error('Pathao credentials are NOT configured.')
    }

    const pathao = this.getClient(credentials)

    console.log("createOrderDto", createOrderDto);
    console.log("pathao", pathao);
    

    try {
      const response = await pathao.createOrder(createOrderDto)
      console.log('response', response)

      return response.data
    } catch (error) {
      this.logger.error('Failed to create Pathao order', error)
      throw error
    }
  }
}
