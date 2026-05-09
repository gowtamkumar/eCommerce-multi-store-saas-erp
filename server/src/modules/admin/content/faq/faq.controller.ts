import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { FaqResponseDto } from './dto/faq-response.dto'
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'
import { FilterFaqDto } from './dto/filter-faq.dto'
import { FaqService } from './faq.service'

@UseGuards(SubscriptionGuard)
@RequireFeature('/admin/faqs')
@Controller('faqs')
export class FaqController {
  private readonly logger = new Logger(FaqController.name)

  constructor(private readonly faqService: FaqService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFaq(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateFaqDto,
  ): Promise<BaseApiSuccessResponse<FaqResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createFaq.`)
    const data = await this.faqService.createFaq(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: `FAQ created successfully`,
      data: data,
    }
  }

  @Get()
  async findAllFaqs(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterFaqDto,
  ): Promise<BaseApiSuccessResponse<FaqResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllFaqs.`)
    const { faqs, total } = await this.faqService.findAllFaqs(filterDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `List of FAQs`,
      data: faqs,
      pagination: {
        total,
        page: filterDto.page,
        limit: filterDto.limit,
        totalPages: Math.ceil(total / filterDto.limit),
      },
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateFaq(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
  ): Promise<BaseApiSuccessResponse<FaqResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateFaq.`)
    const data = await this.faqService.updateFaq(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `FAQ updated successfully`,
      data: data,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeFaq(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFaq.`)
    const result = await this.faqService.removeFaq(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `FAQ deleted successfully`,
      data: null,
    }
  }

  @Post('multiple')
  async findMultipleFaqs(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[] },
  ): Promise<BaseApiSuccessResponse<FaqResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findMultipleFaqs.`)
    const faqs = await this.faqService.findByIdsFaq(body.ids, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `${faqs.length} FAQs retrieved`,
      data: faqs,
    }
  }

  @Post('page')
  async findByPageFaq(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { pageId: string },
  ): Promise<BaseApiSuccessResponse<FaqResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByPageFaq.`)
    const faqs = await this.faqService.findByPageFaq(body.pageId, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `FAQs for page ID ${body.pageId} retrieved`,
      data: faqs,
    }
  }
}
