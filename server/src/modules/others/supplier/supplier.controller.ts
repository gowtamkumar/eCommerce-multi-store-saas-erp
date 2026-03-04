import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
    constructor(private readonly service: SupplierService) { }

    @Post()
    async create(@Body() dto: CreateSupplierDto, @TenantId() tenantId: string) {
        return await this.service.create(dto, tenantId);
    }

    @Get()
    async findAll(@TenantId() tenantId: string) {
        return await this.service.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.service.findOne(id, tenantId);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateSupplierDto,
        @TenantId() tenantId: string,
    ) {
        return await this.service.update(id, dto, tenantId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.service.remove(id, tenantId);
    }
}
