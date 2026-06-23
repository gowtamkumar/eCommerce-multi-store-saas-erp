import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { ShippingAddressRepository } from './shipping-address.repository'
import { ShippingAddressController } from './shipping-address.controller'
import { ShippingAddressService } from './shipping-address.service'
import { AddressValidationService } from './services/address-validation.service'

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddressEntity])],
  controllers: [ShippingAddressController],
  providers: [ShippingAddressService, ShippingAddressRepository, AddressValidationService],
  exports: [ShippingAddressService, ShippingAddressRepository, AddressValidationService],
})
export class ShippingAddressModule {}
