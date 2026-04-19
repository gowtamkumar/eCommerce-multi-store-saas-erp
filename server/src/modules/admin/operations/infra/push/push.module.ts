import { Module } from '@nestjs/common'
import { PushService } from './push.service'
import { PushController } from './push.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceEntity } from './entities/device.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
