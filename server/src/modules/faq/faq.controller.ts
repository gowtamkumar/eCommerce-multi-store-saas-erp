import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { FaqService } from './faq.service';

@Controller('faqs')
export class FaqController {
    constructor(private readonly faqService: FaqService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createFaq(@Body() dto: CreateFaqDto, @TenantId() tenantId: string) {
        const data = await this.faqService.createFaq(dto, tenantId);
        return { success: true, data };
    }

    @Get()
    async findAllFaqs(@Query() filterDto: FilterFaqDto, @TenantId() tenantId: string) {
        const { faqs, total } = await this.faqService.findAllFaqs(filterDto, tenantId);
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
    @UseGuards(JwtAuthGuard)
    async updateFaq(@Param('id') id: string, @Body() dto: UpdateFaqDto, @TenantId() tenantId: string) {
        const data = await this.faqService.updateFaq(id, dto, tenantId);
        return { success: true, data };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async removeFaq(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.faqService.removeFaq(id, tenantId);
    }

    @Post('multiple')
    @UseGuards(JwtAuthGuard)
    async findMultipleFaqs(@Body() body: { ids: string[] }, @TenantId() tenantId: string) {
        const faqs = await this.faqService.findByIdsFaq(body.ids, tenantId);
        return { success: true, data: faqs };
    }

    @Post('page')
    @UseGuards(JwtAuthGuard)
    async findByPageFaq(@Body() body: { pageId: string }, @TenantId() tenantId: string) {
        const faqs = await this.faqService.findByPageFaq(body.pageId, tenantId);
        return { success: true, data: faqs };
    }
}
