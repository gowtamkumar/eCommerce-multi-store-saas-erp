import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common'
import { ClosePosShiftDto } from './dtos/close-pos-shift.dto'
import { CreatePosRegisterDto } from './dtos/create-pos-register.dto'
import { OpenPosShiftDto } from './dtos/open-pos-shift.dto'
import { SyncPosSaleDto } from './dtos/sync-pos-sale.dto'
import { PosRegisterEntity } from './entities/pos-register.entity'
import { PosShiftEntity } from './entities/pos-shift.entity'
import { PosService } from './pos.service'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/pos')
@Controller('pos')
export class PosController {
  private readonly logger = new Logger(PosController.name)

  constructor(private readonly service: PosService) { }

  @Post('register')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async createRegister(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreatePosRegisterDto,
  ): Promise<BaseApiSuccessResponse<PosRegisterEntity>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createRegister.`)
    const register = await this.service.createRegister(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'POS terminal register created successfully',
      data: register,
    }
  }

  @Get('register')
  @RequireFeature('/admin/pos')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async findAllRegisters(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PosRegisterEntity[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllRegisters.`)
    const registers = await this.service.findAllRegisters(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS terminal registers retrieved successfully',
      data: registers,
    }
  }

  @Get('register/:id')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async findOneRegister(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<PosRegisterEntity>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findOneRegister for ${id}.`,
    )
    const register = await this.service.findOneRegister(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS terminal register retrieved successfully',
      data: register,
    }
  }

  @Post('shift/open')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async openShift(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: OpenPosShiftDto,
  ): Promise<BaseApiSuccessResponse<PosShiftEntity>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called openShift.`)
    const shift = await this.service.openShift(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Cashier shift opened successfully',
      data: shift,
    }
  }

  @Get('shift/active')
  @RequireFeature('/admin/pos')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async findActiveShift(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PosShiftEntity>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findActiveShift.`)
    const shift = await this.service.findActiveShift(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Active cashier shift retrieved successfully',
      data: shift,
    }
  }

  @Post('shift/:id/close')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async closeShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: ClosePosShiftDto,
  ): Promise<BaseApiSuccessResponse<PosShiftEntity>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called closeShift for shift ${id}.`,
    )
    const shift = await this.service.closeShift(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Cashier shift closed and audited successfully',
      data: shift,
    }
  }

  @Get('shift')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async getShifts(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PosShiftEntity[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getShifts.`)
    const shifts = await this.service.getShifts(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Cashier shifts retrieved successfully',
      data: shifts,
    }
  }

  @Post('sync')
  @RequirePermissions(SystemPermissions.POS_SALE_CREATE)
  async syncPosSale(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: SyncPosSaleDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called syncPosSale.`)
    await this.service.syncPosSale(dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS offline sale transaction processed and synced successfully',
      data: null,
    }
  }
}
