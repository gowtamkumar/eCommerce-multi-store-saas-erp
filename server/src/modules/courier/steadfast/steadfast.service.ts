import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from '../../settings/settings.service';
import { CreateSteadfastOrderDto } from './dto/create-order.dto';

@Injectable()
export class SteadfastService {
  private readonly logger = new Logger(SteadfastService.name);
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly settingsService: SettingsService,
  ) {}

  private async initializeCredentials(tenantId: string) {
    try {
      // Try to get credentials from settings first
      const settings = await this.settingsService.findByTenant(tenantId);
      
      if (settings?.steadfastCourier) {
        this.baseUrl = this.configService.get<string>('STEADFAST_BASE_URL');
        this.apiKey = settings.steadfastCourier.apiKey || this.configService.get<string>('STEADFAST_API_KEY');
        this.secretKey = settings.steadfastCourier.secretKey || this.configService.get<string>('STEADFAST_SECRET_KEY');
      }
    } catch (error) {
      this.logger.warn('Failed to load settings, using environment variables', error);
      this.baseUrl = this.configService.get<string>('STEADFAST_BASE_URL');
      this.apiKey = this.configService.get<string>('STEADFAST_API_KEY');
      this.secretKey = this.configService.get<string>('STEADFAST_SECRET_KEY');
    }
  }

  async createOrder(createOrderDto: CreateSteadfastOrderDto, tenantId: string) {
    await this.initializeCredentials(tenantId);

    try {
      const url = `${this.baseUrl}/create_order`;

    
      const response = await firstValueFrom(
        this.httpService.post(url, createOrderDto, {
          headers: {
            'Api-Key': this.apiKey,
            'Secret-Key': this.secretKey,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log('Steadfast order created successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Steadfast order', error.response?.data || error.message);
      throw error;
    }
  }
}
