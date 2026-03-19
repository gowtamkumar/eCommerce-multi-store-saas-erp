import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateSupplierDto, UpdateSupplierDto } from '@/modules/admin/operations/finance/supplier/dto/supplier.dto';
import { SupplierService } from '@/modules/admin/operations/finance/supplier/supplier.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
    private readonly logger = new Logger(SupplierController.name);

    constructor(private readonly service: SupplierService) { }

    @Post()
    async createSupplier(@RequestContext() ctx: RequestContextDto, @Body() dto: CreateSupplierDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSupplier.`);
        return await this.service.createSupplier(dto, ctx.tenantId);
    }

    @Get()
    async findAllSuppliers(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllSuppliers.`);
        return await this.service.findAllSuppliers(ctx.tenantId);
    }

    @Get(':id')
    async findOneSupplier(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneSupplier.`);
        return await this.service.findOneSupplier(id, ctx.tenantId);
    }

    @Put(':id')
    async updateSupplier(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body() dto: UpdateSupplierDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSupplier.`);
        return await this.service.updateSupplier(id, dto, ctx.tenantId);
    }

    @Delete(':id')
    async removeSupplier(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeSupplier.`);
        return await this.service.removeSupplier(id, ctx.tenantId);
    }
}
