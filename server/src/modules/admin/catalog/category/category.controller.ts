import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { Audit } from '@/common/decorators/audit.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CategoryResponseDto } from './dto/category-response.dto'

@UseGuards(SubscriptionGuard)
@RequireFeature('/admin/categories')
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name)

  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Category', action: 'CREATE' })
  async createCategory(
    @RequestContext() ctx: RequestContextDto,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createCategory.`)
    const result = await this.categoryService.createCategory(createCategoryDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: `New category created`,
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.CATALOG_READ)
  async findAllCategories(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCategories.`)
    const result = await this.categoryService.findAllCategories(ctx)
    return {
      success: true,
      statusCode: 200,
      message: `List of categories`,
      data: result,
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_READ)
  async findAllCategoriesWithStats(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findAllCategoriesWithStats.`,
    )
    const result = await this.categoryService.findAllCategoriesWithStats(ctx)
    return {
      success: true,
      statusCode: 200,
      message: `List of categories with stats`,
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.CATALOG_READ)
  async findOneCategory(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneCategory.`)
    const result = await this.categoryService.findOneCategory(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Category details`,
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Category', action: 'UPDATE' })
  async updateCategory(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<BaseApiSuccessResponse<CategoryResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCategory.`)
    const result = await this.categoryService.updateCategory(id, updateCategoryDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Category of ID ${id} updated`,
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Category', action: 'DELETE' })
  async removeCategory(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCategory.`)
    const result = await this.categoryService.removeCategory(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Category deleted successfully`,
      data: null,
    }
  }
}
