import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionService } from './promotion.service';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    createPromotion(@Body() createPromotionDto: CreatePromotionDto, @TenantId() tenantId: string) {
        return this.promotionService.createPromotion(createPromotionDto, tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findAllPromotions(@Query() filterDto: any, @TenantId() tenantId: string) {
        return this.promotionService.findAllPromotions(filterDto, tenantId);
    }

    @Get('active')
    findActivePromotions(@TenantId() tenantId: string) {
        return this.promotionService.findActivePromotions(tenantId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findOnePromotion(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.promotionService.findOnePromotion(id, tenantId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    updatePromotion(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto, @TenantId() tenantId: string) {
        return this.promotionService.updatePromotion(id, updatePromotionDto, tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    removePromotion(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.promotionService.removePromotion(id, tenantId);
    }
}
