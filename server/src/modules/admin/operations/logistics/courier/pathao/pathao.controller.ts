import { Body, Controller, Post, UseGuards, Logger } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ApiTags } from '@nestjs/swagger'
import { CreatePathaoOrderDto } from '@/modules/admin/operations/logistics/courier/pathao/dto/create-order.dto'
import { PathaoService } from '@/modules/admin/operations/logistics/courier/pathao/pathao.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@ApiTags('courier/pathao')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courier/pathao')
export class PathaoController {
  private readonly logger = new Logger(PathaoController.name)

  constructor(private readonly pathaoService: PathaoService) {}

  @Post('create-order')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async createPathaoOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() createOrderDto: CreatePathaoOrderDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPathaoOrder.`)
    const result = await this.pathaoService.createPathaoOrder(createOrderDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Pathao order created successfully',
      data: result,
    }
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
