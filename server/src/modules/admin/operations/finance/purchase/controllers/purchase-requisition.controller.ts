import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PurchaseRequisitionService } from '../services/purchase-requisition.service'
import {
  CreatePurchaseRequisitionDto,
  UpdatePurchaseRequisitionStatusDto,
  ConvertPRToPoDto,
} from '../dto/purchase-requisition.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { PRStatus } from '../entities/purchase-requisition.entity'

@ApiTags('Purchase Requisitions')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('purchasing')
@Controller('purchase-requisitions')
export class PurchaseRequisitionController {
  constructor(private readonly service: PurchaseRequisitionService) {}

  @Post()
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreatePurchaseRequisitionDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.createPR(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Purchase Requisition created successfully',
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query() pagination: PaginationDto,
    @Query('status') status?: PRStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findAllPRs(ctx, pagination, status)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase Requisitions retrieved successfully',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findOnePR(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase Requisition retrieved successfully',
      data: result,
    }
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async updateStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseRequisitionStatusDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.updatePRStatus(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase Requisition status updated successfully',
      data: result,
    }
  }

  @Post(':id/convert')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async convert(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: ConvertPRToPoDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.convertToPO(id, dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Purchase Requisition converted to Purchase Order successfully',
      data: result,
    }
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async remove(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.service.deletePR(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase Requisition deleted successfully',
      data: null,
    }
  }
}
