import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('faqs')
export class FaqController {
    constructor(private readonly faqService: FaqService) { }

    @Post()
    async create(@Body() dto: CreateFaqDto, @TenantId() tenantId: string) {
        const data = await this.faqService.create(dto, tenantId);
        return { success: true, data };
    }

    @Get()
    async findAll(@Query() filterDto: FilterFaqDto, @TenantId() tenantId: string) {
        const { faqs, total } = await this.faqService.findAll(filterDto, tenantId);
        return {
            success: true,
            statusCode: 200,
            data: {
                faqs,
                pagination: {
                    total,
                    page: filterDto.page,
                    limit: filterDto.limit,
                    totalPages: Math.ceil(total / filterDto.limit),
                },
            },
        };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateFaqDto, @TenantId() tenantId: string) {
        const data = await this.faqService.update(id, dto, tenantId);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.faqService.remove(id, tenantId);
    }
}
