import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { ShippingAddressService } from './shipping-address.service'
import { ShippingAddressController } from './shipping-address.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddressEntity])],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  exports: [ShippingAddressService],
})
export class ShippingAddressModule {}
