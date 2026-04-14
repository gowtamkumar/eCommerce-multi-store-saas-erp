import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { FilterOrderDto } from '@/modules/admin/sales/order/dto/filter-order.dto'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { Body, Controller, Get, Logger, Param, Post, Patch, Query, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { RequestContextDto } from 'src/common/dto/request-context.dto'
import { OrderResponseDto } from '../dto/order-response.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name)

  constructor(private readonly orderService: OrderService) { }

  // @Throttle({ transactional: { limit: 10, ttl: 60000 } })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR, UserRole.USER)
  async createOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<BaseApiSuccessResponse<{ message: string; order: OrderResponseDto }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createOrder.`)
    const result = await this.orderService.createOrder(createOrderDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Order created successfully',
      data: result as any,
    }
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.OPERATOR,
  )
  async findAllOrders(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterOrderDto,
  ): Promise<BaseApiSuccessResponse<{ orders: OrderResponseDto[]; pagination: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllOrders.`)
    const { orders, total } = await this.orderService.findAllOrders(filterDto, ctx.tenantId)

    return {
      success: true,
      statusCode: 200,
      message: 'Orders retrieved successfully',
      data: {
        orders: orders as any,
        pagination: {
          total,
          page: filterDto.page,
          limit: filterDto.limit,
          totalPages: Math.ceil(total / filterDto.limit),
        },
      },
    }
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.OPERATOR,
  )
  async findOneOrder(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<OrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneOrder.`)
    const order = await this.orderService.findOneOrder(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: order as any,
    }
  }

  @Get('user/:userId/count')
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.OPERATOR,
    UserRole.USER,
  )
  async getUserOrderCount(
    @RequestContext() ctx: RequestContextDto,
    @Param('userId') userId: string,
  ): Promise<BaseApiSuccessResponse<number>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getUserOrderCount.`)
    const count = await this.orderService.countByUserId(userId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'User order count retrieved successfully',
      data: count,
    }
  }

  @Get('user/:userId')
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.OPERATOR,
    UserRole.USER,
  )
  async getUserOrders(
    @RequestContext() ctx: RequestContextDto,
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getUserOrders.`)
    const { orders, total } = await this.orderService.findByUserId(userId, ctx.tenantId, page, limit, search)
    return {
      success: true,
      statusCode: 200,
      message: 'User orders retrieved successfully',
      data: {
        orders: orders as any,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async updateOrder(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<BaseApiSuccessResponse<OrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateOrder.`)
    const order = await this.orderService.updateOrder(id, updateOrderDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Order updated successfully',
      data: order as any,
    }
  }
}
