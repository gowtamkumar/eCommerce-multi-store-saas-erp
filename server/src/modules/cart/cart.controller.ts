import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UserEntity } from '../admin/user/entities/user.entity'
import { CartService } from './cart.service'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: UserEntity, @TenantId() tenantId: string) {
    return this.cartService.createOrGetCart(user.id, tenantId)
  }

  @Post('items')
  addToCart(
    @CurrentUser() user: UserEntity,
    @TenantId() tenantId: string,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.addToCart(user.id, tenantId, createCartItemDto)
  }

  @Patch('items/:id')
  updateCartItem(
    @CurrentUser() user: UserEntity,
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(user.id, tenantId, id, updateCartItemDto)
  }

  @Delete('items/:id')
  removeFromCart(
    @CurrentUser() user: UserEntity,
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.cartService.removeFromCart(user.id, tenantId, id)
  }

  @Delete()
  clearCart(@CurrentUser() user: UserEntity, @TenantId() tenantId: string) {
    return this.cartService.clearCart(user.id, tenantId)
  }
}
