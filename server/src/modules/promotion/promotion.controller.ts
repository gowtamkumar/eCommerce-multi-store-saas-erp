import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UserRole } from 'src/common/enums/user/user-role.enum';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    create(@Body() createPromotionDto: CreatePromotionDto, @TenantId() tenantId: string) {
        return this.promotionService.create(createPromotionDto, tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findAll(@Query() filterDto: any, @TenantId() tenantId: string) {
        return this.promotionService.findAll(filterDto, tenantId);
    }

    @Get('active')
    findActivePromotions(@TenantId() tenantId: string) {
        return this.promotionService.findActivePromotions(tenantId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.promotionService.findOne(id, tenantId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto, @TenantId() tenantId: string) {
        return this.promotionService.update(id, updatePromotionDto, tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.promotionService.remove(id, tenantId);
    }
}
