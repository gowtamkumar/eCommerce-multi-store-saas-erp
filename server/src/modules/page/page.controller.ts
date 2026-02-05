import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageService } from './page.service'

@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  @Post()
  async create(@Body() dto: CreatePageDto, @TenantId() tenantId: string) {
    return await this.pageService.create(dto, tenantId)
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
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto, @TenantId() tenantId: string) {
    return await this.pageService.update(id, dto, tenantId)
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.remove(id, tenantId)
  }
}
