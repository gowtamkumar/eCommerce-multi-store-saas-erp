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
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @TenantId() tenantId: string) {
    return await this.categoryService.createCategory(createCategoryDto, tenantId)
  }

  @Get()
  async findAllCategories(@TenantId() tenantId: string) {
    return await this.categoryService.findAllCategories(tenantId)
  }

  @Get(':id')
  async findOneCategory(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.findOneCategory(id, tenantId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @TenantId() tenantId: string,
  ) {
    return await this.categoryService.updateCategory(id, updateCategoryDto, tenantId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeCategory(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.removeCategory(id, tenantId)
  }
}
