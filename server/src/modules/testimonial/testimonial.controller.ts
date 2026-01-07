import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { FilterTestimonialDto } from './dto/filter-testimonial.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialController {
    constructor(private readonly testimonialService: TestimonialService) { }

    @Post()
    @ApiOperation({ summary: 'Create testimonial' })
    async create(@Body() dto: CreateTestimonialDto, @TenantId() tenantId: string) {
        const data = await this.testimonialService.create(dto, tenantId);
        return { success: true, data };
    }

    @Get()
    @ApiOperation({ summary: 'Get all testimonials with pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated testimonials' })
    async findAll(@Query() filterDto: FilterTestimonialDto, @TenantId() tenantId: string) {
        const { testimonials, total } = await this.testimonialService.findAll(filterDto, tenantId);
        return {
            success: true,
            statusCode: 200,
            data: {
                testimonials,
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
    async update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto, @TenantId() tenantId: string) {
        const data = await this.testimonialService.update(id, dto, tenantId);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.testimonialService.remove(id, tenantId);
    }
}
