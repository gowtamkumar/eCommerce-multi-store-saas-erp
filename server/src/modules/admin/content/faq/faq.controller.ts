import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'
import { FilterFaqDto } from './dto/filter-faq.dto'
import { FaqService } from './faq.service'

@Controller('faqs')
export class FaqController {
  private readonly logger = new Logger(FaqController.name)

  constructor(private readonly faqService: FaqService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async createFaq(@RequestContext() ctx: RequestContextDto, @Body() dto: CreateFaqDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createFaq.`)
    const data = await this.faqService.createFaq(dto, ctx.tenantId)
    return { success: true, data }
  }

  @Get()
  async findAllFaqs(@RequestContext() ctx: RequestContextDto, @Query() filterDto: FilterFaqDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllFaqs.`)
    const { faqs, total } = await this.faqService.findAllFaqs(filterDto, ctx.tenantId)
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
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async updateFaq(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateFaq.`)
    const data = await this.faqService.updateFaq(id, dto, ctx.tenantId)
    return { success: true, data }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removeFaq(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFaq.`)
    return await this.faqService.removeFaq(id, ctx.tenantId)
  }

  @Post('multiple')
  async findMultipleFaqs(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[] },
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findMultipleFaqs.`)
    const faqs = await this.faqService.findByIdsFaq(body.ids, ctx.tenantId)
    return { success: true, data: faqs }
  }

  @Post('page')
  async findByPageFaq(@RequestContext() ctx: RequestContextDto, @Body() body: { pageId: string }) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByPageFaq.`)
    const faqs = await this.faqService.findByPageFaq(body.pageId, ctx.tenantId)
    return { success: true, data: faqs }
  }
}
