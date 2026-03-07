import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { Audit } from 'src/common/decorators/audit.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandController {
    constructor(private readonly brandService: BrandService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @Audit({ entity: 'Brand', action: 'CREATE' })
    async createBrand(@Body() createBrandDto: CreateBrandDto, @CurrentUser() user: any) {
        const data = await this.brandService.createBrand(createBrandDto, user.tenantId);
        return { success: true, data };
    }

    @Get()
    async findAllBrands(@TenantId() tenantId: string) {
        const data = await this.brandService.findAllBrands(tenantId);
        return { success: true, data };
    }

    @Get(':id')
    async findOneBrand(@Param('id') id: string, @TenantId() tenantId: string) {
        const data = await this.brandService.findOneBrand(id, tenantId);
        return { success: true, data };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @Audit({ entity: 'Brand', action: 'UPDATE' })
    async updateBrand(
        @Param('id') id: string,
        @Body() updateBrandDto: UpdateBrandDto,
        @CurrentUser() user: any,
    ) {
        const data = await this.brandService.updateBrand(id, updateBrandDto, user.tenantId);
        return { success: true, data };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @Audit({ entity: 'Brand', action: 'DELETE' })
    async removeBrand(@Param('id') id: string, @CurrentUser() user: any) {
        return await this.brandService.removeBrand(id, user.tenantId);
    }
}
