import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import {
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/modules/admin/operations/finance/supplier/dto/supplier.dto'
import { SupplierService } from '@/modules/admin/operations/finance/supplier/supplier.service'
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
import { SupplierResponseDto } from './dto/supplier-response.dto'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('purchasing')
@Controller('suppliers')
export class SupplierController {
  private readonly logger = new Logger(SupplierController.name)

  constructor(private readonly service: SupplierService) {}

  @Post()
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  async createSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateSupplierDto,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSupplier.`)
    const result = await this.service.createSupplier(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Supplier created successfully',
      data: result as any,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  async findAllSuppliers(
    @RequestContext() ctx: RequestContextDto,
    @Query() paginationDto: PaginationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllSuppliers.`)
    const result = await this.service.findAllSuppliers(ctx, paginationDto)
    return {
      success: true,
      statusCode: 200,
      message: 'List of suppliers retrieved',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  async findOneSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneSupplier.`)
    const result = await this.service.findOneSupplier(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier retrieved',
      data: result as any,
    }
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  async updateSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSupplier.`)
    const result = await this.service.updateSupplier(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier updated successfully',
      data: result as any,
    }
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  async removeSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeSupplier.`)
    await this.service.removeSupplier(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier deleted successfully',
      data: null,
    }
  }
  @Get(':id/ledger')
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  @RequirePermissions(SystemPermissions.SUPPLIER_MANAGE)
  async getLedger(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.getLedger(id, ctx, paginationDto)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier ledger retrieved',
      data: result,
    }
  }
}
