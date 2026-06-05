import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { ShippingAddressRepository } from './shipping-address.repository'
import { ShippingAddressController } from './shipping-address.controller'
import { ShippingAddressService } from './shipping-address.service'

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddressEntity])],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService, ShippingAddressRepository],
  exports: [ShippingAddressService, ShippingAddressRepository],
})
export class ShippingAddressModule {}
