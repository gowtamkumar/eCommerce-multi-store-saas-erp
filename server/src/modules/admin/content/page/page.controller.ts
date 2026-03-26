import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { RequestContext } from "src/common/decorators/request-context.decorator"
import { RequestContextDto } from "src/common/dto/request-context.dto"
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageService } from './page.service'


@Controller('pages')
export class PageController {
  private readonly logger = new Logger(PageController.name);

  constructor(private readonly pageService: PageService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
  async createPage(@RequestContext() ctx: RequestContextDto, @Body() dto: CreatePageDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPage.`);
    const page = await this.pageService.createPage(dto, ctx.tenantId);
    return { success: true, data: page };
  }

  @Get()
  async findAllPages(@RequestContext() ctx: RequestContextDto, @Query('status') status?: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPages.`);
    return {
      success: true,
      data: await this.pageService.findAllPages(ctx.tenantId, status),
    }
  }

  @Get('home')
  async findHomePage(@RequestContext() ctx: RequestContextDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findHomePage.`);
    const data = await this.pageService.findHomePage(ctx.tenantId)
    return {
      statusCode: 200,
      message: 'Home page data fetched successfully',
      success: true,
      data,
    }
  }

  @Get('slug/:slug')
  async findBySlugPage(@RequestContext() ctx: RequestContextDto, @Param('slug') slug: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findBySlugPage.`);
    return await this.pageService.findBySlugPage(slug, ctx.tenantId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing, UserRole.Support, UserRole.Operator)
  async findOnePage(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePage.`);
    return await this.pageService.findOnePage(id, ctx.tenantId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
  async updatePage(@RequestContext() ctx: RequestContextDto, @Param('id') id: string, @Body() dto: UpdatePageDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePage.`);
    return await this.pageService.updatePage(id, dto, ctx.tenantId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.StoreManager)
  async removePage(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removePage.`);
    return await this.pageService.removePage(id, ctx.tenantId)
  }
}
