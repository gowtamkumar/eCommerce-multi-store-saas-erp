import { Module } from '@nestjs/common'
import { PushService } from './push.service'
import { PushController } from './push.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceEntity } from './entities/device.entity'
import { DeviceRepository } from './repositories/device.repository'

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  controllers: [PushController],
  providers: [PushService, DeviceRepository],
  exports: [PushService],
})
export class PushModule {}
