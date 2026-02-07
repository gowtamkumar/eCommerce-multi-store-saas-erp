
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PathaoApiService } from 'pathao-merchant-sdk';
import { SettingsService } from '../../settings/settings.service';
import { CreatePathaoOrderDto } from './dto/create-order.dto';

@Injectable()
export class PathaoService {
  private readonly logger = new Logger(PathaoService.name);

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
    });
  }

  async createOrder(createOrderDto: CreatePathaoOrderDto) {
    const tenantId = 'default'; // TODO: inject request scoped tenantId or pass as arg
    // For now assuming we might need to look up settings. 
    // However, if we don't have request context here, we might need to pass tenantId to createOrder.
    // Given the context of the app is multi-tenant, let's assume we need to deal with tenant.
    // But for this specific task, if not passed, we'll try to load default.
    
    // Better approach: Since we don't have tenantId here easily without request scope, 
    // and the original code just used env vars, let's try to fetch settings if possible.
    // If this service is used within a request, we should probably pass tenantId.
    
    // Let's modify createOrder to accept tenantId optionally or get it from a Context if available.
    // For this step, I will stick to the plan: fetch from settings, fallback to env.
    // Since I don't see tenantId in the CreatePathaoOrderDto, I will assume it might be needed.
    // However, the prompt implies "admin setting option for courier tab", implying global or tenant specific.
    // I'll update the signature to accept tenantId if possible, or just default to env vars if not provided.
    
    // Wait, the current implementation doesn't have tenantId in `createOrder`. 
    // I should probably check `app.module` to see if `PathaoModule` is global or request scoped?
    // It's a normal provider. 
    
    // Let's implement a helper to get credentials.
    
    const baseURL = this.configService.get<string>('PATHAO_BASE_URL');
    const clientId = this.configService.get<string>('PATHAO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PATHAO_CLIENT_SECRET');
    const username = this.configService.get<string>('PATHAO_USERNAME');
    const password = this.configService.get<string>('PATHAO_PASSWORD');

    // Default credentials from ENV
    let credentials = {
      baseURL,
      clientId,
      clientSecret,
      username,
      password,
    };

    // If we can get tenant settings (e.g. passed in DTO or context), we would override here.
    // Since I can't change the method signature drastically without breaking other things (potentially),
    // and the user requirement is just "add field in admin setting", I will query settings for the current context.
    
    // But wait, `createOrder` is called by... whom? `PathaoController`.
    // The controller is likely request scoped or handling a request where we can get the tenant.
    // I'll check `PathaoController` next.
    
    const pathao = this.getClient(credentials);

    try {
      const response = await pathao.createOrder(createOrderDto);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Pathao order', error);
      throw error;
    }
  }


  async createOrderWithTenant(createOrderDto: CreatePathaoOrderDto, tenantId: string) {
      const settings = await this.settingsService.findByTenant(tenantId);
      const courier = settings.pathaoCourier;

      const baseURL = courier.sandboxMode ? this.configService.get<string>('PATHAO_SENDBOX_BASE_URL') :  this.configService.get<string>('PATHAO_BASE_URL')
      const clientId = courier?.pathaoClientId
      const clientSecret = courier?.pathaoClientSecret 
      const username = courier?.pathaoUsername
      const password = courier?.pathaoPassword

       if (!clientId || !clientSecret || !username || !password) {
        this.logger.warn('Pathao credentials are missing.');
        throw new Error('Pathao credentials are NOT configured.');
      }

      const pathao = new PathaoApiService({
        baseURL,
        clientId,
        clientSecret,
        username,
        password,
      });

      try {
        const response = await pathao.createOrder(createOrderDto);
        return response.data;
      } catch (error) {
        this.logger.error('Failed to create Pathao order', error);
        throw error;
      }
  }
}
