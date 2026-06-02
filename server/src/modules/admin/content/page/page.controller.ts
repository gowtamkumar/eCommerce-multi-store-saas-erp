import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PageResponseDto } from './dto/page-response.dto'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageService } from './page.service'

/**
 * Admin-only page management. All routes require authentication and
 * CONTENT_MANAGE permission. Public storefront reads live in
 * StorePageController under `/store/pages` so there is no chance of
 * accidentally exposing drafts here.
 */
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('content')
@RequirePermissions(SystemPermissions.CONTENT_MANAGE)
@Controller('pages')
export class PageController {
  private readonly logger = new Logger(PageController.name)

  constructor(private readonly pageService: PageService) {}

  @Post()
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

  @Get(':id')
  async findOnePage(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
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
  async updatePage(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
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
  async removePage(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removePage.`)
    const result = await this.pageService.removePage(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Page deleted successfully`,
      data: null,
    }
  }

  @Get(':id/revisions')
  async listRevisions(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<unknown[]>> {
    const data = await this.pageService.listRevisions(id, ctx)
    return { success: true, statusCode: 200, message: 'Page revisions', data }
  }

  @Post(':id/revisions/:revisionId/restore')
  async restoreRevision(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
  ): Promise<BaseApiSuccessResponse<unknown>> {
    const data = await this.pageService.restoreRevision(id, revisionId, ctx)
    return { success: true, statusCode: 200, message: 'Page restored from revision', data }
  }
}
