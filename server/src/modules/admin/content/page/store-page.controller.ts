import { Public } from '@/common/decorators/public.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Controller, Get, Logger, Param } from '@nestjs/common'
import { PageResponseDto } from './dto/page-response.dto'
import { PageService } from './page.service'

/**
 * Storefront-facing page reads. Mounted on a distinct URL prefix so:
 *  - admin writes and public reads cannot collide on the same path,
 *  - every route here is unambiguously public (no auth, always published-only),
 *  - guards on /pages can stay strict without juggling per-route @Public flags.
 *
 * Anything that needs to expose unpublished content (preview tokens, drafts)
 * should live in PageController behind a token guard, not here.
 */
@Public()
@Controller('store/pages')
export class StorePageController {
  private readonly logger = new Logger(StorePageController.name)

  constructor(private readonly pageService: PageService) {}

  @Get()
  async list(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PageResponseDto[]>> {
    this.logger.verbose('Storefront list of published pages')
    const data = await this.pageService.findAllPagesPublic(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'List of published pages',
      data,
    }
  }

  @Get('home')
  async home(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose('Storefront home page')
    const data = await this.pageService.findHomePage(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Home page data fetched successfully',
      data: data as PageResponseDto,
    }
  }

  @Get('slug/:slug')
  async bySlug(
    @RequestContext() ctx: RequestContextDto,
    @Param('slug') slug: string,
  ): Promise<BaseApiSuccessResponse<PageResponseDto>> {
    this.logger.verbose(`Storefront page by slug: ${slug}`)
    const data = await this.pageService.findBySlugPage(slug, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Page details for slug: ${slug}`,
      data,
    }
  }
}
