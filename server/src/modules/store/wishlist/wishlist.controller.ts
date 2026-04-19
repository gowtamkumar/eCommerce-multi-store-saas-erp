import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { WishlistResponseDto } from './dto/wishlist-response.dto'
import { AddToWishlistDto } from './dto/wishlist.dto'
import { WishlistService } from './wishlist.service'

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  private readonly logger = new Logger(WishlistController.name)

  constructor(private readonly wishlistService: WishlistService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Add or remove a product from the wishlist' })
  async toggleWishlist(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: AddToWishlistDto,
  ): Promise<BaseApiSuccessResponse<{ added: boolean }>> {
    this.logger.verbose(`User "${ctx.userId}" calling toggleWishlist for product ${dto.productId}`)
    const result = await this.wishlistService.toggleWishlist(ctx, dto.productId)
    return {
      success: true,
      statusCode: 201,
      message: result.added ? 'Added to wishlist' : 'Removed from wishlist',
      data: result,
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all wishlist items for the current user' })
  async getWishlist(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<WishlistResponseDto[]>> {
    this.logger.verbose(`User "${ctx.userId}" calling getWishlist`)
    const result = await this.wishlistService.getWishlist(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Wishlist retrieved successfully',
      data: result as any,
    }
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a specific product from the wishlist' })
  async removeFromWishlist(
    @RequestContext() ctx: RequestContextDto,
    @Param('productId') productId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.userId}" calling removeFromWishlist for product ${productId}`)
    await this.wishlistService.removeFromWishlist(ctx, productId)
    return {
      success: true,
      statusCode: 200,
      message: 'Product removed from wishlist',
      data: null,
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the entire wishlist for the current user' })
  async clearWishlist(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.userId}" calling clearWishlist`)
    await this.wishlistService.clearWishlist(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Wishlist cleared successfully',
      data: null,
    }
  }
}
