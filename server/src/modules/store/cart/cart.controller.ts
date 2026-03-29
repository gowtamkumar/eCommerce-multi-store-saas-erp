import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CartService } from './cart.service'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from 'src/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { CartResponseDto } from './dto/cart-response.dto'

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name)

  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCart.`)
    const cart = await this.cartService.createOrGetCart(ctx.userId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Cart retrieved successfully',
      data: cart,
    }
  }

  @Post('items')
  async addToCart(
    @RequestContext() ctx: RequestContextDto,
    @Body() createCartItemDto: CreateCartItemDto,
  ): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called addToCart.`)
    const cart = await this.cartService.addToCart(ctx.userId, ctx.tenantId, createCartItemDto)
    return {
      success: true,
      statusCode: 200,
      message: 'Item added to cart',
      data: cart,
    }
  }

  @Post('sync')
  async syncCart(
    @RequestContext() ctx: RequestContextDto,
    @Body() items: CreateCartItemDto[],
  ): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called syncCart.`)
    const cart = await this.cartService.syncCart(ctx.userId, ctx.tenantId, items)
    return {
      success: true,
      statusCode: 200,
      message: 'Cart synced successfully',
      data: cart,
    }
  }

  @Patch('items/:id')
  async updateCartItem(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCartItem.`)
    const cart = await this.cartService.updateCartItem(ctx.userId, ctx.tenantId, id, updateCartItemDto)
    return {
      success: true,
      statusCode: 200,
      message: 'Cart item updated',
      data: cart,
    }
  }

  @Delete('items/:id')
  async removeFromCart(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFromCart.`)
    const cart = await this.cartService.removeFromCart(ctx.userId, ctx.tenantId, id)
    return {
      success: true,
      statusCode: 200,
      message: 'Item removed from cart',
      data: cart,
    }
  }

  @Delete()
  async clearCart(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called clearCart.`)
    await this.cartService.clearCart(ctx.userId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Cart cleared',
      data: null,
    }
  }

  @Post('coupon/apply')
  async applyCoupon(
    @RequestContext() ctx: RequestContextDto,
    @Body('code') code: string,
  ): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called applyCoupon.`)
    const cart = await this.cartService.applyCoupon(ctx.userId, ctx.tenantId, code)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon applied successfully',
      data: cart,
    }
  }

  @Post('coupon/remove')
  async removeCoupon(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<CartResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCoupon.`)
    const cart = await this.cartService.removeCoupon(ctx.userId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon removed from cart',
      data: cart,
    }
  }
}
