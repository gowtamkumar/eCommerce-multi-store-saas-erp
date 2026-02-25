import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @TenantId() tenantId: string,
    ) {
        return await this.orderService.create(createOrderDto, tenantId);
    }

    @Get()
    async findAll(
        @Query() filterDto: FilterOrderDto,
        @TenantId() tenantId: string,
    ) {
        const { orders, total } = await this.orderService.findAll(
            filterDto,
            tenantId,
        );

        return {
            success: true,
            statusCode: 200,
            data: {
                orders,
                pagination: {
                    total,
                    page: filterDto.page,
                    limit: filterDto.limit,
                    totalPages: Math.ceil(total / filterDto.limit),
                },
            },
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        const order = await this.orderService.findOne(id, tenantId);
        return {
            success: true,
            statusCode: 200,
            data: order,
        };
    }

    @Get('user/:userId')
    async getUserOrders(
        @Param('userId') userId: string,
        @Query('search') search: string,
        @TenantId() tenantId: string,
    ) {
        const orders = await this.orderService.findByUserId(userId, tenantId, search);
        return {
            success: true,
            statusCode: 200,
            data: orders,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
        @TenantId() tenantId: string,
    ) {
        const order = await this.orderService.update(id, updateOrderDto, tenantId);
        return {
            success: true,
            statusCode: 200,
            data: order,
        };
    }
}
