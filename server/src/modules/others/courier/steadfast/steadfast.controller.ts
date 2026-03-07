import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';
import { CreateSteadfastOrderDto } from './dto/create-order.dto';
import { SteadfastService } from './steadfast.service';

@ApiTags('courier/steadfast')
@Controller('courier/steadfast')
export class SteadfastController {
  constructor(private readonly steadfastService: SteadfastService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
  async createSteadfastOrder(@Body() createOrderDto: CreateSteadfastOrderDto, @TenantId() tenantId: string) {
    return this.steadfastService.createSteadfastOrder(createOrderDto, tenantId);
  }
}
