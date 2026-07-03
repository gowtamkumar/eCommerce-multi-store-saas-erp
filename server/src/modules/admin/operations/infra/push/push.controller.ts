import { Public } from '@/common/decorators/public.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RegisterDeviceDto, UnregisterDeviceDto } from './dto/device.dto'
import { PushService } from './push.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@ApiTags('Push Notifications')
@Controller('notifications')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register device for push notifications' })
  // @UseGuards(StoreGuard) - We might want to allow this public-facing API to use a store ID via header, same as other store APIs.
  async registerDevice(@Body() dto: RegisterDeviceDto, @RequestContext() ctx: RequestContextDto) {
    if (!ctx.storeId) {
      throw new Error('Store ID is required')
    }
    await this.pushService.registerDevice(dto, ctx)
    return { success: true, message: 'Device registered successfully' }
  }

  @Post('unregister')
  @ApiOperation({ summary: 'Unregister device from push notifications' })
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async unregisterDevice(
    @Body() dto: UnregisterDeviceDto,
    @RequestContext() ctx: RequestContextDto,
  ) {
    if (!ctx.storeId) {
      throw new Error('Store ID is required')
    }
    await this.pushService.unregisterDevice(dto, ctx)
    return { success: true, message: 'Device unregistered successfully' }
  }
}
