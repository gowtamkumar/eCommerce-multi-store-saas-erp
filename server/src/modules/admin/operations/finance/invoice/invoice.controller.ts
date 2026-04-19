import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
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
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name)

  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
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
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
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
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
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
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
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
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
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
