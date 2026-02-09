import { Body, Controller, Post } from '@nestjs/common';
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
}
