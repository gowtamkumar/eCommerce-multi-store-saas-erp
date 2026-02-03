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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandController {
    constructor(private readonly brandService: BrandService) { }

    @Post()
    async create(@Body() createBrandDto: CreateBrandDto, @CurrentUser() user: any) {
        const data = await this.brandService.create(createBrandDto, user.tenantId);
        return { success: true, data };
    }

    @Get()
    async findAll(@CurrentUser() user: any) {
        const data = await this.brandService.findAll(user.tenantId);
        return { success: true, data };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: any) {
        const data = await this.brandService.findOne(id, user.tenantId);
        return { success: true, data };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateBrandDto: UpdateBrandDto,
        @CurrentUser() user: any,
    ) {
        const data = await this.brandService.update(id, updateBrandDto, user.tenantId);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
        return await this.brandService.remove(id, user.tenantId);
    }
}
