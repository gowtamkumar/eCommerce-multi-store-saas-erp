import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @TenantId() tenantId: string) {
    return await this.categoryService.create(createCategoryDto, tenantId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for tenant' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  async findAll(@TenantId() tenantId: string) {
    return await this.categoryService.findAll(tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Returns category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.findOne(id, tenantId)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @TenantId() tenantId: string,
  ) {
    return await this.categoryService.update(id, updateCategoryDto, tenantId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.remove(id, tenantId)
  }
}
