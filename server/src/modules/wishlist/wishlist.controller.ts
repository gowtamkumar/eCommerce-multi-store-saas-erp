import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../admin/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../admin/auth/guards/jwt-auth.guard';
import { UserEntity } from '../admin/user/entities/user.entity';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Get()
    getWishlist(@CurrentUser() user: UserEntity, @TenantId() tenantId: string) {
        return this.wishlistService.createOrGetWishlist(user.id, tenantId);
    }

    @Post('items')
    addToWishlist(
        @CurrentUser() user: UserEntity,
        @TenantId() tenantId: string,
        @Body() createWishlistItemDto: CreateWishlistItemDto,
    ) {
        return this.wishlistService.addToWishlist(user.id, tenantId, createWishlistItemDto);
    }

    @Delete('items/:productId')
    removeFromWishlist(
        @CurrentUser() user: UserEntity,
        @TenantId() tenantId: string,
        @Param('productId') productId: string,
    ) {
        return this.wishlistService.removeFromWishlist(user.id, tenantId, productId);
    }
}
