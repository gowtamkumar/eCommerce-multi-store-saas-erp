import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ShippingAddressRepository } from './shipping-address.repository'
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto'
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto'

@Injectable()
export class ShippingAddressService {
  private readonly logger = new Logger(ShippingAddressService.name)

  constructor(
    private readonly repo: ShippingAddressRepository,
  ) {}

  async findShippingAddresses(userId: string, tenantId: string) {
    this.logger.log(`${this.findShippingAddresses.name} Service Called`)
    return await this.repo.findAllByUserId(userId, tenantId)
  }

  async findShippingAddress(id: string, userId: string, tenantId: string) {
    const address = await this.repo.findById(id, userId, tenantId)
    if (!address) throw new NotFoundException('Shipping address not found')
    return address
  }

  async createShippingAddress(userId: string, tenantId: string, dto: CreateShippingAddressDto) {
    this.logger.log(`${this.createShippingAddress.name} Service Called`)
    // If isDefault, unset existing defaults first
    if (dto.isDefault) {
      await this.repo.unsetDefaults(userId, tenantId)
    }
    return await this.repo.createAndSave(userId, tenantId, dto)
  }

  async updateShippingAddress(
    id: string,
    userId: string,
    tenantId: string,
    dto: UpdateShippingAddressDto,
  ) {
    this.logger.log(`${this.updateShippingAddress.name} Service Called`)
    const address = await this.findShippingAddress(id, userId, tenantId)
    if (dto.isDefault) {
      await this.repo.unsetDefaults(userId, tenantId)
    }
    return await this.repo.updateAndSave(address, dto)
  }

  async setDefaultShippingAddress(id: string, userId: string, tenantId: string) {
    this.logger.log(`${this.setDefaultShippingAddress.name} Service Called`)
    const address = await this.findShippingAddress(id, userId, tenantId)
    await this.repo.unsetDefaults(userId, tenantId)
    return await this.repo.updateAndSave(address, { isDefault: true })
  }

  async removeShippingAddress(id: string, userId: string, tenantId: string) {
    this.logger.log(`${this.removeShippingAddress.name} Service Called`)
    const address = await this.findShippingAddress(id, userId, tenantId)
    await this.repo.removeAddress(address)
    return { success: true, message: 'Shipping address deleted' }
  }
}
