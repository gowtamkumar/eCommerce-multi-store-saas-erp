
import { Body, Controller, Post } from '@nestjs/common';
import { CreatePathaoOrderDto } from './dto/create-order.dto';
import { PathaoService } from './pathao.service';

@Controller('courier/pathao')
export class PathaoController {
  constructor(private readonly pathaoService: PathaoService) {}

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreatePathaoOrderDto) {
    return await this.pathaoService.createOrder(createOrderDto);
  }
}
