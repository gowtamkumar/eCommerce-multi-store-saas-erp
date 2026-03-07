import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSteadfastOrderDto } from './dto/create-order.dto';
import { SteadfastService } from './steadfast.service';
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@ApiTags('courier/steadfast')
@Controller('courier/steadfast')
export class SteadfastController {
    private readonly logger = new Logger(SteadfastController.name);

  constructor(private readonly steadfastService: SteadfastService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
  async createSteadfastOrder(@RequestContext() ctx: RequestContextDto, @Body() createOrderDto: CreateSteadfastOrderDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSteadfastOrder.`);
      return this.steadfastService.createSteadfastOrder(createOrderDto, ctx.tenantId);
    }
}
