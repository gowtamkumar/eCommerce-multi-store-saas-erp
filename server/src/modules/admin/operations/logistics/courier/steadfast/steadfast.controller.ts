import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSteadfastOrderDto } from '@/modules/admin/operations/logistics/courier/steadfast/dto/create-order.dto';
import { SteadfastService } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@ApiTags('courier/steadfast')
@Controller('courier/steadfast')
export class SteadfastController {
  private readonly logger = new Logger(SteadfastController.name);

  constructor(private readonly steadfastService: SteadfastService) { }

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
  async createSteadfastOrder(@RequestContext() ctx: RequestContextDto, @Body() createOrderDto: CreateSteadfastOrderDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSteadfastOrder.`);
    return this.steadfastService.createSteadfastOrder(createOrderDto, ctx.tenantId);
  }
}
