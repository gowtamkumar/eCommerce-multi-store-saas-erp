import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CategoryResponseDto } from './dto/category-response.dto'

@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name)

  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async createCategory(
    @RequestContext() ctx: RequestContextDto,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createCategory.`)
    const result = await this.categoryService.createCategory(createCategoryDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: `New category created`,
      data: result,
    }
  }

  @Get()
  async findAllCategories(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCategories.`)
    const result = await this.categoryService.findAllCategories(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `List of categories`,
      data: result,
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async findAllCategoriesWithStats(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCategoriesWithStats.`)
    const result = await this.categoryService.findAllCategoriesWithStats(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `List of categories with stats`,
      data: result,
    }
  }

  @Get(':id')
  async findOneCategory(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneCategory.`)
    const result = await this.categoryService.findOneCategory(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `Category details`,
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async updateCategory(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCategory.`)
    const result = await this.categoryService.updateCategory(id, updateCategoryDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `Category of ID ${id} updated`,
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removeCategory(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCategory.`)
    const result = await this.categoryService.removeCategory(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Category deleted successfully`,
      data: null,
    }
  }
}
