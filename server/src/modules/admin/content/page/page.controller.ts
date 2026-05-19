import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { Public } from '@/common/decorators/public.decorator'
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
import { PageResponseDto } from './dto/page-response.dto'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageService } from './page.service'

@UseGuards(SubscriptionGuard)
@RequireFeature('/admin/pages')
@Controller('pages')
export class PageController {
  private readonly logger = new Logger(PageController.name)

  constructor(private readonly pageService: PageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CONTENT_MANAGE)
  async createPage(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreatePageDto,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPage.`)
    const page = await this.pageService.createPage(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: `Page created successfully`,
      data: page,
    }
  }

  @Get()
  @Public()
  async findAllPages(
    @RequestContext() ctx: RequestContextDto,
    @Query('status') status?: string,
  ): Promise<BaseApiSuccessResponse<PageResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPages.`)
    const result = await this.pageService.findAllPages(ctx, status)
    return {
      success: true,
      statusCode: 200,
      message: `List of pages`,
      data: result,
    }
  }

  @Get('home')
  @Public()
  async findHomePage(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findHomePage.`)
    const data = await this.pageService.findHomePage(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Home page data fetched successfully',
      data: data,
    }
  }

  @Get('slug/:slug')
  @Public()
  async findBySlugPage(
    @RequestContext() ctx: RequestContextDto,
    @Param('slug') slug: string,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findBySlugPage.`)
    const result = await this.pageService.findBySlugPage(slug, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Page details for slug: ${slug}`,
      data: result,
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CONTENT_MANAGE)
  async findOnePage(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePage.`)
    const result = await this.pageService.findOnePage(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Page details`,
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CONTENT_MANAGE)
  async updatePage(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePage.`)
    const result = await this.pageService.updatePage(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Page updated successfully`,
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CONTENT_MANAGE)
  async removePage(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removePage.`)
    const result = await this.pageService.removePage(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Page deleted successfully`,
      data: null,
    }
  }
}
