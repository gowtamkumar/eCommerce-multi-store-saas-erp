import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { SupplierService } from './supplier.service';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
    constructor(private readonly service: SupplierService) { }

    @Post()
    async createSupplier(@Body() dto: CreateSupplierDto, @TenantId() tenantId: string) {
        return await this.service.createSupplier(dto, tenantId);
    }

    @Get()
    async findAllSuppliers(@TenantId() tenantId: string) {
        return await this.service.findAllSuppliers(tenantId);
    }

    @Get(':id')
    async findOneSupplier(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.service.findOneSupplier(id, tenantId);
    }

    @Put(':id')
    async updateSupplier(
        @Param('id') id: string,
        @Body() dto: UpdateSupplierDto,
        @TenantId() tenantId: string,
    ) {
        return await this.service.updateSupplier(id, dto, tenantId);
    }

    @Delete(':id')
    async removeSupplier(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.service.removeSupplier(id, tenantId);
    }
}
