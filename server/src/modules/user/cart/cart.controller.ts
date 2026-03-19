import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Logger } from '@nestjs/common'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { UserEntity } from 'src/modules/admin/core/user/entities/user.entity'
import { CartService } from './cart.service'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
    private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) { }

  @Get()
  getCart(@RequestContext() ctx: RequestContextDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCart.`);
      return this.cartService.createOrGetCart(ctx.userId, ctx.tenantId)
    }

  @Post('items')
  addToCart(
    @RequestContext() ctx: RequestContextDto, @Body() createCartItemDto: CreateCartItemDto,
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called addToCart.`);
      return this.cartService.addToCart(ctx.userId, ctx.tenantId, createCartItemDto)
    }

  @Post('sync')
  syncCart(
    @RequestContext() ctx: RequestContextDto, @Body() items: CreateCartItemDto[],
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called syncCart.`);
      return this.cartService.syncCart(ctx.userId, ctx.tenantId, items)
    }

  @Patch('items/:id')
  updateCartItem(
    @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCartItem.`);
      return this.cartService.updateCartItem(ctx.userId, ctx.tenantId, id, updateCartItemDto)
    }

  @Delete('items/:id')
  removeFromCart(
    @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFromCart.`);
      return this.cartService.removeFromCart(ctx.userId, ctx.tenantId, id)
    }

  @Delete()
  clearCart(@RequestContext() ctx: RequestContextDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called clearCart.`);
      return this.cartService.clearCart(ctx.userId, ctx.tenantId)
    }

  @Post('coupon/apply')
  applyCoupon(
    @RequestContext() ctx: RequestContextDto, @Body('code') code: string,
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called applyCoupon.`);
      return this.cartService.applyCoupon(ctx.userId, ctx.tenantId, code)
    }

  @Post('coupon/remove')
  removeCoupon(@RequestContext() ctx: RequestContextDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCoupon.`);
      return this.cartService.removeCoupon(ctx.userId, ctx.tenantId)
    }
}
