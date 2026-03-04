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
  async create(@Body() dto: CreatePageDto, @TenantId() tenantId: string) {
    const page = await this.pageService.create(dto, tenantId);
    return { success: true, data: page };
  }

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return {
      success: true,
      data: await this.pageService.findAll(tenantId),
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
  async findBySlug(@Param('slug') slug: string, @TenantId() tenantId: string) {
    return await this.pageService.findBySlug(slug, tenantId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.findOne(id, tenantId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto, @TenantId() tenantId: string) {
    return await this.pageService.update(id, dto, tenantId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.remove(id, tenantId)
  }
}
