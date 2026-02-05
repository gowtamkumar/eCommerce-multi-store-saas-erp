import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
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
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @TenantId() tenantId: string,
  ) {
    return await this.categoryService.update(id, updateCategoryDto, tenantId)
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.categoryService.remove(id, tenantId)
  }
}
