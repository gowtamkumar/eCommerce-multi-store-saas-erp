import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { CreatePageDto, UpdatePageDto } from './dto/page.dto'
import { PageService } from './page.service'

@ApiTags('Pages')
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) { }

  @Post()
  @ApiOperation({ summary: 'Create page' })
  async create(@Body() dto: CreatePageDto, @TenantId() tenantId: string) {
    return await this.pageService.create(dto, tenantId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all pages' })
  async findAll(@TenantId() tenantId: string) {
    return {
      success: true,
      data: await this.pageService.findAll(tenantId),
    }
  }

  @Get('home')
  @ApiOperation({ summary: 'Get home page' })
  async findHomePage(@TenantId() tenantId: string) {
    console.log('home api', tenantId)

    return await this.pageService.findHomePage(tenantId)
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  async findBySlug(@Param('slug') slug: string, @TenantId() tenantId: string) {
    return await this.pageService.findBySlug(slug, tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.findOne(id, tenantId)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update page' })
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto, @TenantId() tenantId: string) {
    return await this.pageService.update(id, dto, tenantId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete page' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.pageService.remove(id, tenantId)
  }
}
