import { Module } from '@nestjs/common'
import { ShippingAddressController } from './shipping-address.controller'
import { ShippingAddressService } from './shipping-address.service'

@Module({
  imports: [],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService],
  exports: [ShippingAddressService],
})
export class ShippingAddressModule {}
