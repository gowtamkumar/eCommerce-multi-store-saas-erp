import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { GrnService } from './grn.service'
import { CreateGrnDto, VerifyGrnDto } from './dto/grn.dto'
import { GrnStatus } from '@/common/enums/grn-status.enum'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/grn')
@Controller('operations/logistics/grn')
export class GrnController {
  constructor(private readonly grnService: GrnService) {}

  @Post()
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async create(
    @Body() dto: CreateGrnDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.grnService.createGrn(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Goods Received Note created successfully',
      data,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status: GrnStatus,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.grnService.findAll(ctx, paginationDto, status)
    return {
      success: true,
      statusCode: 200,
      message: 'GRNs fetched successfully',
      data,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  async findOne(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.grnService.findById(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'GRN fetched successfully',
      data,
    }
  }

  @Patch(':id/verify')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyGrnDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.grnService.verifyGrn(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `GRN ${dto.status} successfully`,
      data,
    }
  }
}
