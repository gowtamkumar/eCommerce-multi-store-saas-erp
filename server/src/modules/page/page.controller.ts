import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageService } from './page.service'

@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPage(@Body() dto: CreatePageDto, @TenantId() tenantId: string) {
    const page = await this.pageService.createPage(dto, tenantId);
    return { success: true, data: page };
  }

  @Get()
  async findAllPages(@TenantId() tenantId: string) {
    return {
      success: true,
      data: await this.pageService.findAllPages(tenantId),
    }
  }

  @Get('home')
  async findHomePage(@TenantId() tenantId: string) {
    const data = await this.pageService.findHomePage(tenantId)
    return {
      statusCode: 200,
      message: 'Home page data fetched successfully',
      success: true,
      data,
    }
  }

  @Get('slug/:slug')
  async findBySlugPage(@Param('slug') slug: string, @TenantId() tenantId: string) {
    return await this.pageService.findBySlugPage(slug, tenantId)
  }

  @Get(':id')
  async findOnePage(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.findOnePage(id, tenantId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto, @TenantId() tenantId: string) {
    return await this.pageService.updatePage(id, dto, tenantId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removePage(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.removePage(id, tenantId)
  }
}
