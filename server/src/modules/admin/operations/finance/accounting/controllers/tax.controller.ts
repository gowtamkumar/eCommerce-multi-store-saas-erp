import { Audit } from '@/common/decorators/audit.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Controller, Get, Post, Put, Delete, UseGuards, Body, Param, Query } from '@nestjs/common'
import { TaxService } from '../services/tax.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { TaxCategory } from '../entities/tax-rule.entity'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('finance')
@Controller('finance/tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('init')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async seedDefaultRules(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<void>> {
    await this.taxService.seedDefaultStoreTaxRules(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'System tax rules initialized successfully',
      data: null,
    }
  }

  @Get('rules')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getTaxRules(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.taxService.getTaxRules(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Tax rules retrieved successfully',
      data,
    }
  }

  @Post('rules')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  @Audit({ entity: 'TaxRule', action: 'CREATE' })
  async createTaxRule(
    @RequestContext() ctx: RequestContextDto,
    @Body()
    body: { name: string; rate: number; country: string; state?: string; category: TaxCategory },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.taxService.createTaxRule(body, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Tax rule created successfully',
      data,
    }
  }

  @Put('rules/:id')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  @Audit({ entity: 'TaxRule', action: 'UPDATE' })
  async updateTaxRule(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { name: string; rate: number; isActive: boolean },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.taxService.updateTaxRule(id, body, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Tax rule updated successfully',
      data,
    }
  }

  @Delete('rules/:id')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  @Audit({ entity: 'TaxRule', action: 'DELETE' })
  async deleteTaxRule(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<void>> {
    await this.taxService.deleteTaxRule(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Tax rule deleted successfully',
      data: null,
    }
  }

  @Post('calculate')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async calculateTax(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { country: string; state?: string; category?: TaxCategory; baseAmount: number },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.taxService.calculateTax(ctx, body)
    return {
      success: true,
      statusCode: 200,
      message: 'Tax calculated successfully',
      data,
    }
  }

  @Get('filing')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getTaxFiling(
    @RequestContext() ctx: RequestContextDto,
    @Query() query: { startDate?: string; endDate?: string },
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.taxService.generateTaxFiling(ctx, query)
    return {
      success: true,
      statusCode: 200,
      message: 'Tax filing returns generated successfully',
      data,
    }
  }
}
