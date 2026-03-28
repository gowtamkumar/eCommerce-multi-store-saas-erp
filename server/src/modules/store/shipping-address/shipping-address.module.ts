import { Module } from '@nestjs/common'
import { ShippingAddressService } from './shipping-address.service'
import { ShippingAddressController } from './shipping-address.controller'

@Module({
  imports: [],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  exports: [ShippingAddressService],
})
export class ShippingAddressModule {}
