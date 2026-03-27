import { Body, Controller, Post, UseGuards, Logger } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateSteadfastOrderDto } from '@/modules/admin/operations/logistics/courier/steadfast/dto/create-order.dto'
import { SteadfastService } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@ApiTags('courier/steadfast')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courier/steadfast')
export class SteadfastController {
  private readonly logger = new Logger(SteadfastController.name)

  constructor(private readonly steadfastService: SteadfastService) {}

  @Post('create-order')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
  async createSteadfastOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() createOrderDto: CreateSteadfastOrderDto,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSteadfastOrder.`)
    return this.steadfastService.createSteadfastOrder(createOrderDto, ctx.tenantId)
  }
}
