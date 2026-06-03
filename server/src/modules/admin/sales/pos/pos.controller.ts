import { Audit } from '@/common/decorators/audit.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
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
  ParseUUIDPipe,
} from '@nestjs/common'
import { ClosePosShiftDto } from './dtos/close-pos-shift.dto'
import { CreatePosRegisterDto } from './dtos/create-pos-register.dto'
import { OpenPosShiftDto } from './dtos/open-pos-shift.dto'
import { SyncPosSaleDto } from './dtos/sync-pos-sale.dto'
import { CreateDrawerTransactionDto } from './dtos/create-drawer-transaction.dto'
import { PosRegisterEntity } from './entities/pos-register.entity'
import { PosShiftEntity } from './entities/pos-shift.entity'
import { PosDrawerTransactionEntity } from './entities/pos-drawer-transaction.entity'
import { PosService } from './pos.service'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('pos')
@Controller('pos')
export class PosController {
  private readonly logger = new Logger(PosController.name)

  constructor(private readonly service: PosService) {}

  @Post('register')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  @Audit({ entity: 'PosRegister', action: 'CREATE' })
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
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<PosRegisterEntity>> {
    const sanitizedId = id.replace(/[\r\n]/g, '_')
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findOneRegister for ${sanitizedId}.`,
    )
    const register = await this.service.findOneRegister(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS terminal register retrieved successfully',
      data: register,
    }
  }

  @Patch('register/:id')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  @Audit({ entity: 'PosRegister', action: 'UPDATE' })
  async updateRegister(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ): Promise<BaseApiSuccessResponse<PosRegisterEntity>> {
    const sanitizedId = id.replace(/[\r\n]/g, '_')
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called updateRegister for ${sanitizedId}.`,
    )
    const register = await this.service.updateRegister(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS terminal register updated successfully',
      data: register,
    }
  }

  @Delete('register/:id')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  @Audit({ entity: 'PosRegister', action: 'DELETE' })
  async deleteRegister(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    const sanitizedId = id.replace(/[\r\n]/g, '_')
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called deleteRegister for ${sanitizedId}.`,
    )
    await this.service.deleteRegister(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS terminal register deleted successfully',
      data: null,
    }
  }

  @Post('shift/open')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  @Audit({ entity: 'PosShift', action: 'OPEN' })
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
  @Audit({ entity: 'PosShift', action: 'CLOSE' })
  async closeShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ClosePosShiftDto,
  ): Promise<BaseApiSuccessResponse<PosShiftEntity>> {
    const sanitizedId = id.replace(/[\r\n]/g, '_')
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called closeShift for shift ${sanitizedId}.`,
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
  @Audit({ entity: 'PosSale', action: 'SYNC' })
  async syncPosSale(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: SyncPosSaleDto,
  ): Promise<BaseApiSuccessResponse<{ orderId?: string }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called syncPosSale.`)
    const result = await this.service.syncPosSale(dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'POS offline sale transaction processed and synced successfully',
      data: result.data || null,
    }
  }

  @Post('shift/:id/drawer-transaction')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  @Audit({ entity: 'PosDrawerTransaction', action: 'CREATE' })
  async createDrawerTransaction(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDrawerTransactionDto,
  ): Promise<BaseApiSuccessResponse<PosDrawerTransactionEntity>> {
    const sanitizedId = id.replace(/[\r\n]/g, '_')
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called createDrawerTransaction for shift ${sanitizedId}.`,
    )
    const tx = await this.service.createDrawerTransaction(id, dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Drawer transaction recorded successfully',
      data: tx,
    }
  }

  @Get('shift/:id/drawer-transactions')
  @RequirePermissions(SystemPermissions.POS_SHIFT_MANAGE)
  async getDrawerTransactions(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<PosDrawerTransactionEntity[]>> {
    const sanitizedId = id.replace(/[\r\n]/g, '_')
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called getDrawerTransactions for shift ${sanitizedId}.`,
    )
    const txs = await this.service.getDrawerTransactionsForShift(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Drawer transactions retrieved successfully',
      data: txs,
    }
  }
}
