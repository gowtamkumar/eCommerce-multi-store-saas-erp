import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { FilterOrderDto } from './dto/filter-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @TenantId() tenantId: string,
    ) {
        return await this.orderService.create(createOrderDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated orders' })
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
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiResponse({ status: 200, description: 'Returns order' })
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.orderService.findOne(id, tenantId);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get orders by user ID' })
    @ApiResponse({ status: 200, description: 'Returns user orders' })
    async getUserOrders(
        @Param('userId') userId: string,
        @TenantId() tenantId: string,
    ) {
        console.log("tenantId", tenantId);
        console.log("userId", userId);
        return await this.orderService.findByUserId(userId, tenantId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update order status' })
    @ApiResponse({ status: 200, description: 'Order updated successfully' })
    async update(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
        @TenantId() tenantId: string,
    ) {
        return await this.orderService.update(id, updateOrderDto, tenantId);
    }
}
