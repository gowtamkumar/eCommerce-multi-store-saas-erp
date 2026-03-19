import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards, Logger
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateOrderDto } from '@/modules/admin/order/dto/create-order.dto';
import { FilterOrderDto } from '@/modules/admin/order/dto/filter-order.dto';
import { UpdateOrderDto } from '@/modules/admin/order/dto/update-order.dto';
import { OrderService } from '@/modules/admin/order/order.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@Controller('orders')
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(private readonly orderService: OrderService) { }

    @Post()
    async createOrder(
        @RequestContext() ctx: RequestContextDto, @Body() createOrderDto: CreateOrderDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createOrder.`);
        return await this.orderService.createOrder(createOrderDto, ctx.tenantId);
    }

    @Get()
    async findAllOrders(
        @RequestContext() ctx: RequestContextDto, @Query() filterDto: FilterOrderDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllOrders.`);
        const { orders, total } = await this.orderService.findAllOrders(
            filterDto,
            ctx.tenantId,
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
    async findOneOrder(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneOrder.`);
        const order = await this.orderService.findOneOrder(id, ctx.tenantId);
        return {
            success: true,
            statusCode: 200,
            data: order,
        };
    }

    @Get('user/:userId')
    async getUserOrders(
        @RequestContext() ctx: RequestContextDto, @Param('userId') userId: string,
        @Query('search') search: string
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getUserOrders.`);
        const orders = await this.orderService.findByUserId(userId, ctx.tenantId, search);
        return {
            success: true,
            statusCode: 200,
            data: orders,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateOrder(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateOrder.`);
        const order = await this.orderService.updateOrder(id, updateOrderDto, ctx.tenantId);
        return {
            success: true,
            statusCode: 200,
            data: order,
        };
    }
}
