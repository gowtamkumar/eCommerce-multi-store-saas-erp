import { Audit } from '@/common/decorators/audit.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Public } from '@/common/decorators/public.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { BrandService } from './brand.service'
import { BrandResponseDto } from './dto/brand-response.dto'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'

@UseGuards(SubscriptionGuard)
@RequireFeature('catalog')
@Controller('brands')
export class BrandController {
  private readonly logger = new Logger(BrandController.name)

  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Brand', action: 'CREATE' })
  async createBrand(
    @RequestContext() ctx: RequestContextDto,
    @Body() createBrandDto: CreateBrandDto,
  ): Promise<BaseApiSuccessResponse<BrandResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createBrand.`)
    const result = await this.brandService.createBrand(createBrandDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: `New brand created`,
      data: result,
    }
  }

  @Get()
  @Public()
  async findAllBrands(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<BrandResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllBrands.`)
    const result = await this.brandService.findAllBrands(ctx)
    return {
      success: true,
      statusCode: 200,
      message: `List of brands`,
      data: result,
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_READ)
  async findAllBrandsWithStats(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllBrandsWithStats.`)
    const result = await this.brandService.findAllBrandsWithStats(ctx)
    return {
      success: true,
      statusCode: 200,
      message: `List of brands with stats`,
      data: result,
    }
  }

  @Get(':id')
  @Public()
  async findOneBrand(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<BrandResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneBrand.`)
    const result = await this.brandService.findOneBrand(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Brand details`,
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Brand', action: 'UPDATE' })
  async updateBrand(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<BaseApiSuccessResponse<BrandResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateBrand.`)
    const result = await this.brandService.updateBrand(id, updateBrandDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Brand of ID ${id} updated`,
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Brand', action: 'DELETE' })
  async removeBrand(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeBrand.`)
    const result = await this.brandService.removeBrand(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Brand deleted successfully`,
      data: null,
    }
  }
}
