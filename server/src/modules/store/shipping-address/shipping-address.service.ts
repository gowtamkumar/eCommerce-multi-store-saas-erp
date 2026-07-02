import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ShippingAddressRepository } from './shipping-address.repository'
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto'
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AddressValidationService } from './services/address-validation.service'

@Injectable()
export class ShippingAddressService {
  private readonly logger = new Logger(ShippingAddressService.name)

  constructor(
    private readonly repo: ShippingAddressRepository,
    private readonly addressValidationService: AddressValidationService,
  ) {}

  async findShippingAddresses(ctx: RequestContextDto): Promise<ShippingAddressEntity[]> {
    this.logger.log(`${this.findShippingAddresses.name} Service Called`)
    const storeId = ctx.storeId
    const userId = ctx.userId
    return await this.repo.findAllByUserId(userId, storeId)
  }

  async findShippingAddress(id: string, ctx: RequestContextDto): Promise<ShippingAddressEntity> {
    const storeId = ctx.storeId
    const userId = ctx.userId
    const address = await this.repo.findById(id, userId, storeId)
    if (!address) throw new NotFoundException('Shipping address not found')
    return address
  }

  async createShippingAddress(
    ctx: RequestContextDto,
    dto: CreateShippingAddressDto,
  ): Promise<ShippingAddressEntity> {
    this.logger.log(`${this.createShippingAddress.name} Service Called`)
    const storeId = ctx.storeId
    const userId = ctx.userId

    // Validate the address
    await this.addressValidationService.validateAddress(dto)

    // If isDefault, unset existing defaults first
    if (dto.isDefault) {
      await this.repo.unsetDefaults(userId, storeId)
    }
    return await this.repo.createAndSave(dto, ctx)
  }

  async updateShippingAddress(
    id: string,
    ctx: RequestContextDto,
    dto: UpdateShippingAddressDto,
  ): Promise<ShippingAddressEntity> {
    this.logger.log(`${this.updateShippingAddress.name} Service Called`)
    const storeId = ctx.storeId
    const userId = ctx.userId
    const address = await this.findShippingAddress(id, ctx)

    // Validate the updated address fields merged with existing values
    await this.addressValidationService.validateAddress({
      ...address,
      ...dto,
    } as any)

    if (dto.isDefault) {
      await this.repo.unsetDefaults(userId, storeId)
    }
    return await this.repo.updateAndSave(address, dto)
  }

  async setDefaultShippingAddress(
    id: string,
    ctx: RequestContextDto,
  ): Promise<ShippingAddressEntity> {
    this.logger.log(`${this.setDefaultShippingAddress.name} Service Called`)
    const storeId = ctx.storeId
    const userId = ctx.userId
    const address = await this.findShippingAddress(id, ctx)
    await this.repo.unsetDefaults(userId, storeId)
    return await this.repo.updateAndSave(address, { isDefault: true })
  }

  async removeShippingAddress(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeShippingAddress.name} Service Called`)
    const address = await this.findShippingAddress(id, ctx)
    await this.repo.removeAddress(address)
    return { success: true, message: 'Shipping address deleted' }
  }
}
