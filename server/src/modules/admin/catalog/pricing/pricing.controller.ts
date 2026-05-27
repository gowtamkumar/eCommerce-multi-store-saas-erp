import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AddProductPriceDto } from './dto/add-product-price.dto'
import { CreatePriceBookDto } from './dto/create-price-book.dto'
import { PricingService } from './pricing.service'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('catalog')
@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) { }

  @Post('price-books')
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  async createPriceBook(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreatePriceBookDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.service.createPriceBook(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Price book created successfully',
      data,
    }
  }

  @Get('price-books')
  @RequirePermissions(SystemPermissions.CATALOG_READ)
  async findAllPriceBooks(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.service.findAllPriceBooks(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Price books retrieved successfully',
      data,
    }
  }

  @Post('product-prices')
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  async addProductPrice(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: AddProductPriceDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.service.addProductPrice(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Product price added successfully',
      data,
    }
  }

  @Get('product-prices/:productId')
  @RequirePermissions(SystemPermissions.CATALOG_READ)
  async findProductPrices(
    @RequestContext() ctx: RequestContextDto,
    @Param('productId') productId: string,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.service.findProductPrices(productId, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Product prices retrieved successfully',
      data,
    }
  }

  @Delete('product-prices/:id')
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  async deleteProductPrice(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.service.deleteProductPrice(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Product price deleted successfully',
      data: null,
    }
  }

  @Patch('price-books/:id')
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  async updatePriceBook(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.service.updatePriceBook(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Price book updated successfully',
      data,
    }
  }

  @Delete('price-books/:id')
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  async deletePriceBook(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.service.deletePriceBook(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Price book deleted successfully',
      data: null,
    }
  }
}
