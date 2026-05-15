import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateWarehouseBinDto, CreateWarehouseDto, UpdateWarehouseBinDto, UpdateWarehouseDto } from '../dto/warehouse.dto'
import { WarehouseService } from '../services/warehouse.service'

@UseGuards(JwtAuthGuard)
@Controller('system/warehouses')
export class WarehouseController {
  private readonly logger = new Logger(WarehouseController.name)

  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() createWarehouseDto: CreateWarehouseDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.warehouseService.create(createWarehouseDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Warehouse created successfully',
      data: result,
    }
  }

  @Get()
  async findAll(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.warehouseService.findAll(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'List of warehouses',
      data: result,
    }
  }

  @Get(':id')
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.warehouseService.findOne(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Warehouse details',
      data: result,
    }
  }

  @Patch(':id')
  async update(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.warehouseService.update(id, updateWarehouseDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Warehouse updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  async remove(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.warehouseService.remove(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Warehouse deleted successfully',
      data: null,
    }
  }

  // Bin Management
  @Post(':id/bins')
  async addBin(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') warehouseId: string,
    @Body() createBinDto: CreateWarehouseBinDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.warehouseService.addBin(warehouseId, createBinDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Bin added successfully',
      data: result,
    }
  }

  @Patch('bins/:binId')
  async updateBin(
    @RequestContext() ctx: RequestContextDto,
    @Param('binId') binId: string,
    @Body() updateBinDto: UpdateWarehouseBinDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.warehouseService.updateBin(binId, updateBinDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Bin updated successfully',
      data: result,
    }
  }

  @Delete('bins/:binId')
  async removeBin(
    @RequestContext() ctx: RequestContextDto,
    @Param('binId') binId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.warehouseService.removeBin(binId, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Bin removed successfully',
      data: null,
    }
  }
}
