import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('leads')
export class LeadController {
    constructor(private readonly leadService: LeadService) { }

    @Post()
    async create(@Body() dto: CreateLeadDto, @TenantId() tenantId: string) {
        return await this.leadService.create(dto, tenantId);
    }

    @Get()
    async findAll(@Query() filterDto: FilterLeadDto, @TenantId() tenantId: string) {
        const { leads, total } = await this.leadService.findAll(filterDto, tenantId);
        return {
            success: true,
            statusCode: 200,
            data: {
                leads,
                pagination: {
                    total,
                    page: filterDto.page,
                    limit: filterDto.limit,
                    totalPages: Math.ceil(total / filterDto.limit),
                },
            },
        };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @TenantId() tenantId: string) {
        return await this.leadService.update(id, dto, tenantId);
    }
}
