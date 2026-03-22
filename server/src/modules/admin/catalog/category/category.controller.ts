import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Logger } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CategoryService } from '@/modules/admin/catalog/category/category.service'
import { CreateCategoryDto } from '@/modules/admin/catalog/category/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/admin/catalog/category/dto/update-category.dto'
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
  async createCategory(@RequestContext() ctx: RequestContextDto, @Body() createCategoryDto: CreateCategoryDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createCategory.`);
    return await this.categoryService.createCategory(createCategoryDto, ctx.tenantId)
  }

  @Get()
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing, UserRole.Support, UserRole.Operator)
  async findAllCategories(@RequestContext() ctx: RequestContextDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCategories.`);
    return await this.categoryService.findAllCategories(ctx.tenantId)
  }

  @Get(':id')
  async findOneCategory(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneCategory.`);
    return await this.categoryService.findOneCategory(id, ctx.tenantId)
  }

  @Put(':id')
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
  async updateCategory(
    @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCategory.`);
    return await this.categoryService.updateCategory(id, updateCategoryDto, ctx.tenantId)
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.StoreManager)
  async removeCategory(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCategory.`);
    return await this.categoryService.removeCategory(id, ctx.tenantId)
  }
}
