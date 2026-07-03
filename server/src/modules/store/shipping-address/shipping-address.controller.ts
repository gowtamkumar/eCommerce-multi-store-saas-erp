import { CustomerRoute } from '@/common/decorators/customer-route.decorator'
import { SkipPermissionCheck } from '@/common/decorators/skip-permission-check.decorator'
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
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto'
import { ShippingAddressResponseDto } from './dto/shipping-address-response.dto'
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto'
import { ShippingAddressService } from './shipping-address.service'

@CustomerRoute()
@SkipPermissionCheck()
@UseGuards(JwtAuthGuard)
@Controller('store/shipping-address')
export class ShippingAddressController {
  private readonly logger = new Logger(ShippingAddressController.name)

  constructor(private readonly service: ShippingAddressService) {}

  @Get()
  async findShippingAddresses(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ShippingAddressResponseDto[]>> {
    this.logger.log(`${this.findShippingAddresses.name} Controller Called`)
    const addresses = await this.service.findShippingAddresses(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shipping addresses retrieved successfully',
      data: addresses,
    }
  }

  @Get(':id')
  async findShippingAddress(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ShippingAddressResponseDto>> {
    const address = await this.service.findShippingAddress(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shipping address retrieved successfully',
      data: address,
    }
  }

  @Post()
  async createShippingAddress(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateShippingAddressDto,
  ): Promise<BaseApiSuccessResponse<ShippingAddressResponseDto>> {
    this.logger.log(`${this.createShippingAddress.name} Controller Called`)
    const address = await this.service.createShippingAddress(ctx, dto)
    return {
      success: true,
      statusCode: 201,
      message: 'Shipping address created successfully',
      data: address,
    }
  }

  @Patch(':id')
  async updateShippingAddress(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: UpdateShippingAddressDto,
  ): Promise<BaseApiSuccessResponse<ShippingAddressResponseDto>> {
    const address = await this.service.updateShippingAddress(id, ctx, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Shipping address updated successfully',
      data: address,
    }
  }

  @Patch(':id/default')
  async setDefaultShippingAddress(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ShippingAddressResponseDto>> {
    const address = await this.service.setDefaultShippingAddress(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Default shipping address updated',
      data: address,
    }
  }

  @Delete(':id')
  async removeShippingAddress(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.service.removeShippingAddress(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shipping address deleted successfully',
      data: null,
    }
  }
}
