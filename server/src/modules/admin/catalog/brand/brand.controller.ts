import { Audit } from '@/common/decorators/audit.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common'
import { BrandService } from './brand.service'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'

@Controller('brands')
export class BrandController {
  private readonly logger = new Logger(BrandController.name)

  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  @Audit({ entity: 'Brand', action: 'CREATE' })
  async createBrand(
    @RequestContext() ctx: RequestContextDto,
    @Body() createBrandDto: CreateBrandDto,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createBrand.`)
    const data = await this.brandService.createBrand(createBrandDto, ctx.user.tenantId)
    return { success: true, data }
  }

  @Get()
  async findAllBrands(@RequestContext() ctx: RequestContextDto): Promise<any> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllBrands.`)
    const data = await this.brandService.findAllBrands(ctx.tenantId)
    return { success: true, data }
  }

  @Get(':id')
  async findOneBrand(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneBrand.`)
    const data = await this.brandService.findOneBrand(id, ctx.tenantId)
    return { success: true, data }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  @Audit({ entity: 'Brand', action: 'UPDATE' })
  async updateBrand(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateBrand.`)
    const data = await this.brandService.updateBrand(id, updateBrandDto, ctx.user.tenantId)
    return { success: true, data }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Audit({ entity: 'Brand', action: 'DELETE' })
  async removeBrand(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeBrand.`)
    return await this.brandService.removeBrand(id, ctx.user.tenantId)
  }
}
