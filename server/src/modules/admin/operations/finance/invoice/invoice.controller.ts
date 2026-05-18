import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
import { InvoiceResponseDto } from './dto/invoice-response.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { InvoiceService } from './invoice.service'

@Controller('invoices')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/invoices')
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name)

  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<InvoiceResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createInvoice.`)
    const result = await this.invoiceService.createInvoice(createInvoiceDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Invoice created successfully',
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  async findAllInvoices(
    @RequestContext() ctx: RequestContextDto,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: InvoiceStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllInvoices.`)
    const result = await this.invoiceService.findAllInvoices(ctx, paginationDto, status)
    return {
      success: true,
      statusCode: 200,
      message: 'List of invoices retrieved',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  async findOneInvoice(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<InvoiceResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneInvoice.`)
    const result = await this.invoiceService.findOneInvoice(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoice retrieved',
      data: result,
    }
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<InvoiceResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateInvoice.`)
    const result = await this.invoiceService.updateInvoice(id, updateInvoiceDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoice updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  @RequirePermissions(SystemPermissions.INVOICES_MANAGE)
  async removeInvoice(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeInvoice.`)
    await this.invoiceService.removeInvoice(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoice deleted successfully',
      data: null,
    }
  }
}
