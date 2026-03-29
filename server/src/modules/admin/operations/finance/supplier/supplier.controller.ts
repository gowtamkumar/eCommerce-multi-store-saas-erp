import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Logger } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import {
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/modules/admin/operations/finance/supplier/dto/supplier.dto'
import { SupplierService } from '@/modules/admin/operations/finance/supplier/supplier.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SupplierResponseDto } from './dto/supplier-response.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SupplierController {
  private readonly logger = new Logger(SupplierController.name)

  constructor(private readonly service: SupplierService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async createSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateSupplierDto,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSupplier.`)
    const result = await this.service.createSupplier(dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Supplier created successfully',
      data: result as any,
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findAllSuppliers(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllSuppliers.`)
    const result = await this.service.findAllSuppliers(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'List of suppliers retrieved',
      data: result as any,
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findOneSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneSupplier.`)
    const result = await this.service.findOneSupplier(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier retrieved',
      data: result as any,
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updateSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<BaseApiSuccessResponse<SupplierResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSupplier.`)
    const result = await this.service.updateSupplier(id, dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier updated successfully',
      data: result as any,
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removeSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeSupplier.`)
    await this.service.removeSupplier(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier deleted successfully',
      data: null,
    }
  }
}
