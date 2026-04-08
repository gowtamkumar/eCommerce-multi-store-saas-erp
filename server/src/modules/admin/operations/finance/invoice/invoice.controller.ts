import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
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
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req: any,
  ): Promise<BaseApiSuccessResponse<InvoiceResponseDto>> {
    const result = await this.invoiceService.createInvoice(createInvoiceDto, req.user.tenantId)
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
    @Request() req: any,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: InvoiceStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.invoiceService.findAllInvoices(
      req.user.tenantId,
      paginationDto,
      status,
    )
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
    @Request() req: any,
  ): Promise<BaseApiSuccessResponse<InvoiceResponseDto>> {
    const result = await this.invoiceService.findOneInvoice(id, req.user.tenantId)
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
    @Request() req: any,
  ): Promise<BaseApiSuccessResponse<InvoiceResponseDto>> {
    const result = await this.invoiceService.updateInvoice(id, updateInvoiceDto, req.user.tenantId)
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
    @Request() req: any,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.invoiceService.removeInvoice(id, req.user.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoice deleted successfully',
      data: null,
    }
  }
}
