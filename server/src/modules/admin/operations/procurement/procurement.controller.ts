import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { ProcurementService } from './procurement.service'

@UseGuards(JwtAuthGuard)
@Controller('operations/procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) { }

  @Post('suppliers')
  async createSupplier(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.procurementService.createSupplier(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Supplier created successfully',
      data: res,
    }
  }

  @Get('suppliers')
  async getSuppliers(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.procurementService.getSuppliers(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Suppliers fetched successfully',
      data: res,
    }
  }

  @Post('orders')
  async createPurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.procurementService.createPurchaseOrder(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Purchase Order created successfully',
      data: res,
    }
  }

  @Post('grn')
  async processGRN(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.procurementService.processGRN(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Goods Received Note processed successfully',
      data: res,
    }
  }
}
