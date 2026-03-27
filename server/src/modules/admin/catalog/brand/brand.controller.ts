import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards, Logger,
    Ip,
    HostParam,
    Redirect
} from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Audit } from '@/common/decorators/audit.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";
import { BrandService } from './brand.service';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

@Controller('brands')
export class BrandController {
    private readonly logger = new Logger(BrandController.name);

    constructor(private readonly brandService: BrandService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
    @Audit({ entity: 'Brand', action: 'CREATE' })
    async createBrand(@RequestContext() ctx: RequestContextDto, @Body() createBrandDto: CreateBrandDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createBrand.`);
        const data = await this.brandService.createBrand(createBrandDto, ctx.user.tenantId);
        return { success: true, data };
    }

    @Get()
    async findAllBrands(@RequestContext() ctx: RequestContextDto): Promise<any> {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllBrands.`);
        const data = await this.brandService.findAllBrands(ctx.tenantId);
        return { success: true, data };
    }

    @Get(':id')
    async findOneBrand(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneBrand.`);
        const data = await this.brandService.findOneBrand(id, ctx.tenantId);
        return { success: true, data };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
    @Audit({ entity: 'Brand', action: 'UPDATE' })
    async updateBrand(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body() updateBrandDto: UpdateBrandDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateBrand.`);
        const data = await this.brandService.updateBrand(id, updateBrandDto, ctx.user.tenantId);
        return { success: true, data };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin, UserRole.StoreManager)
    @Audit({ entity: 'Brand', action: 'DELETE' })
    async removeBrand(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeBrand.`);
        return await this.brandService.removeBrand(id, ctx.user.tenantId);
    }
}
