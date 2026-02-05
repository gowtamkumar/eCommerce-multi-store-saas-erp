import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { FaqService } from './faq.service';

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

    @Post('multiple')
    async findMultiple(@Body() body: { ids: string[] }, @TenantId() tenantId: string) {
        const faqs = await this.faqService.findByIds(body.ids, tenantId);
        return { success: true, data: faqs };
    }
}
