import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Logger } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionService } from './promotion.service';
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";
import { TenantId } from 'src/common/decorators/tenant-id.decorator';

@Controller('promotions')
export class PromotionController {
    private readonly logger = new Logger(PromotionController.name);

    constructor(private readonly promotionService: PromotionService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    createPromotion(@RequestContext() ctx: RequestContextDto, @Body() createPromotionDto: CreatePromotionDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPromotion.`);
        return this.promotionService.createPromotion(createPromotionDto, ctx.tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findAllPromotions(@RequestContext() ctx: RequestContextDto, @Query() filterDto: any) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPromotions.`);
        return this.promotionService.findAllPromotions(filterDto, ctx.tenantId);
    }

    @Get('active')
    findActivePromotions(@TenantId() tenantId: string) {
        this.logger.verbose(`User "${tenantId}" called findActivePromotions.`);
        return this.promotionService.findActivePromotions(tenantId);
    }

    // ─── Public endpoint (no auth) — used by storefront /offers page ───
    @Get('offers')
    getOfferProducts(@TenantId() tenantId: string) {
        this.logger.verbose(`[Public] getOfferProducts called for tenant: ${tenantId}`);
        return this.promotionService.getOfferProducts(tenantId);
    }

    @Get('slug/:slug')
    getPromotionBySlug(@Param('slug') slug: string, @TenantId() tenantId: string) {
        this.logger.verbose(`[Public] getPromotionBySlug called for slug: ${slug}, tenant: ${tenantId}`);
        return this.promotionService.getOfferProductsBySlug(slug, tenantId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findOnePromotion(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePromotion.`);
        return this.promotionService.findOne(id, ctx.tenantId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    updatePromotion(@RequestContext() ctx: RequestContextDto, @Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePromotion.`);
        return this.promotionService.updatePromotion(id, updatePromotionDto, ctx.tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    removePromotion(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removePromotion.`);
        return this.promotionService.removePromotion(id, ctx.tenantId);
    }
}
