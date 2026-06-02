import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SupplierInvoiceService } from '../services/supplier-invoice.service'
import {
  CreateSupplierInvoiceDto,
  UpdateSupplierInvoiceStatusDto,
} from '../dto/supplier-invoice.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { SupplierInvoiceStatus } from '../entities/supplier-invoice.entity'
import { RecordSupplierPaymentDto } from '../dto/record-payment.dto'

@ApiTags('Supplier Invoices')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('purchasing')
@Controller('supplier-invoices')
export class SupplierInvoiceController {
  constructor(private readonly service: SupplierInvoiceService) {}

  @Post()
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateSupplierInvoiceDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.createInvoice(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Supplier Invoice created and matching complete',
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query() pagination: PaginationDto,
    @Query('status') status?: SupplierInvoiceStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findAllInvoices(ctx, pagination, status)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier Invoices retrieved successfully',
      data: result,
    }
  }

  @Get('aging')
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async getAgingReport(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const result = await this.service.getApAgingReport(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Accounts Payable aging report retrieved successfully',
      data: result,
    }
  }

  @Post('batch-payment')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async runBatchPayment(
    @RequestContext() ctx: RequestContextDto,
    @Body()
    dto: {
      invoiceIds: string[]
      paymentMethod: string
      transactionId?: string
      note?: string
    },
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.batchPayInvoices(dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Batch payment run executed successfully',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findOneInvoice(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier Invoice retrieved successfully',
      data: result,
    }
  }

  @Post(':id/payments')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async pay(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: RecordSupplierPaymentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.payInvoice(id, dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Payment recorded against invoice successfully',
      data: result,
    }
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async updateStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierInvoiceStatusDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.updateStatus(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier Invoice status updated successfully',
      data: result,
    }
  }
}
