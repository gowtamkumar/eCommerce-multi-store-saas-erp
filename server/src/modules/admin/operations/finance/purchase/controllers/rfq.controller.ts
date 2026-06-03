import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Audit } from '@/common/decorators/audit.decorator'
import { RfqService } from '../services/rfq.service'
import { CreateRfqDto, CreateQuotationDto, UpdateRfqStatusDto } from '../dto/rfq.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { RFQStatus } from '../entities/rfq.entity'

@ApiTags('RFQs & Quotations')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('purchasing')
@Controller('rfqs')
export class RfqController {
  constructor(private readonly service: RfqService) {}

  @Post()
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @Audit({ entity: 'Rfq', action: 'CREATE' })
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateRfqDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.createRfq(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'RFQ created successfully',
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query() pagination: PaginationDto,
    @Query('status') status?: RFQStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findAllRfqs(ctx, pagination, status)
    return {
      success: true,
      statusCode: 200,
      message: 'RFQs retrieved successfully',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findOneRfq(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'RFQ retrieved successfully',
      data: result,
    }
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @Audit({ entity: 'Rfq', action: 'STATUS_CHANGE' })
  async updateStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateRfqStatusDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.updateRfqStatus(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'RFQ status updated successfully',
      data: result,
    }
  }

  @Post(':id/quotations')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @Audit({ entity: 'Quotation', action: 'SUBMIT' })
  async submitQuotation(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: CreateQuotationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.submitQuotation(id, dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Supplier Quotation submitted successfully',
      data: result,
    }
  }

  @Post('quotations/:id/award')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @Audit({ entity: 'Quotation', action: 'AWARD' })
  async award(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.awardQuotation(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Quotation awarded successfully, Purchase Order generated',
      data: result,
    }
  }
}
