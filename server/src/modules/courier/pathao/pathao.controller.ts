import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';
import { CreatePathaoOrderDto } from './dto/create-order.dto';
import { PathaoService } from './pathao.service';

@ApiTags('courier/pathao')
@Controller('courier/pathao')
export class PathaoController {
  constructor(private readonly pathaoService: PathaoService) {}

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreatePathaoOrderDto, @TenantId() tenantId: string) {
    return await this.pathaoService.createOrder(createOrderDto, tenantId);
  }

  @Get('stores')
  async getStores(@TenantId() tenantId: string) {
    return await this.pathaoService.getStores(tenantId);
  }

  @Get('cities')
  async getCities(@TenantId() tenantId: string) {
    return await this.pathaoService.getCities(tenantId);
  }

  @Get('city/:cityId/zones')
  async getZones(@Param('cityId') cityId: string, @TenantId() tenantId: string) {
    return await this.pathaoService.getZones(Number(cityId), tenantId);
  }

  @Get('zone/:zoneId/areas')
  async getAreas(@Param('zoneId') zoneId: string, @TenantId() tenantId: string) {
    return await this.pathaoService.getAreas(Number(zoneId), tenantId);
  }
}
