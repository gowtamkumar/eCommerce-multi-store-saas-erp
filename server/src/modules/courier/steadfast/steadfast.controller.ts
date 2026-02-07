import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSteadfastOrderDto } from './dto/create-order.dto';
import { SteadfastService } from './steadfast.service';

@ApiTags('courier/steadfast')
@Controller('courier/steadfast')
export class SteadfastController {
  constructor(private readonly steadfastService: SteadfastService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
  async createOrder(@Body() createOrderDto: CreateSteadfastOrderDto) {
    return this.steadfastService.createOrder(createOrderDto);
  }
}
