import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { TenantId } from 'src/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto, @TenantId() tenantId: string) {
    return await this.categoryService.create(createCategoryDto, tenantId)
  }

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return await this.categoryService.findAll(tenantId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.findOne(id, tenantId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @TenantId() tenantId: string,
  ) {
    return await this.categoryService.update(id, updateCategoryDto, tenantId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.remove(id, tenantId)
  }
}
