import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePathaoOrderDto } from '@/modules/admin/others/courier/pathao/dto/create-order.dto';
import { PathaoService } from '@/modules/admin/others/courier/pathao/pathao.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@ApiTags('courier/pathao')
@Controller('courier/pathao')
export class PathaoController {
  private readonly logger = new Logger(PathaoController.name);

  constructor(private readonly pathaoService: PathaoService) { }

  @Post('create-order')
  async createPathaoOrder(@RequestContext() ctx: RequestContextDto, @Body() createOrderDto: CreatePathaoOrderDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPathaoOrder.`);
    return await this.pathaoService.createPathaoOrder(createOrderDto, ctx.tenantId);
  }

  // @Get('stores')
  // async getStores(@TenantId() tenantId: string) {
  //   return await this.pathaoService.getStores(tenantId);
  // }

  // @Get('cities')
  // async getCities(@TenantId() tenantId: string) {
  //   return await this.pathaoService.getCities(tenantId);
  // }

  // @Get('city/:cityId/zones')
  // async getZones(@Param('cityId') cityId: string, @TenantId() tenantId: string) {
  //   return await this.pathaoService.getZones(Number(cityId), tenantId);
  // }

  // @Get('zone/:zoneId/areas')
  // async getAreas(@Param('zoneId') zoneId: string, @TenantId() tenantId: string) {
  //   return await this.pathaoService.getAreas(Number(zoneId), tenantId);
  // }
}
