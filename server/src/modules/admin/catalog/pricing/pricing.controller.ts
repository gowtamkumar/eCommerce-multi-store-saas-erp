import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { PricingService } from './pricing.service'
import { CreatePriceBookDto } from './dto/create-price-book.dto'
import { AddProductPriceDto } from './dto/add-product-price.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/catalog')
@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Post('price-books')
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
}
