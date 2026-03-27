import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto'
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto'

@Injectable()
export class ShippingAddressService {
  private readonly logger = new Logger(ShippingAddressService.name)

  constructor(
    @InjectRepository(ShippingAddressEntity)
    private readonly repo: Repository<ShippingAddressEntity>,
  ) {}

  async findShippingAddresses(userId: string, tenantId: string) {
    this.logger.log(`${this.findShippingAddresses.name} Service Called`)
    return this.repo.find({ where: { userId, tenantId }, order: { isDefault: 'DESC' } })
  }

  async findShippingAddress(id: string, userId: string, tenantId: string) {
    const address = await this.repo.findOne({ where: { id, userId, tenantId } })
    if (!address) throw new NotFoundException('Shipping address not found')
    return address
  }

  async createShippingAddress(userId: string, tenantId: string, dto: CreateShippingAddressDto) {
    this.logger.log(`${this.createShippingAddress.name} Service Called`)
    // If isDefault, unset existing defaults first
    if (dto.isDefault) {
      await this.repo.update({ userId, tenantId }, { isDefault: false })
    }
    const entity = this.repo.create({ ...dto, userId, tenantId })
    return this.repo.save(entity)
  }

  async updateShippingAddress(
    id: string,
    userId: string,
    tenantId: string,
    dto: UpdateShippingAddressDto,
  ) {
    this.logger.log(`${this.updateShippingAddress.name} Service Called`)
    await this.findShippingAddress(id, userId, tenantId)
    if (dto.isDefault) {
      await this.repo.update({ userId, tenantId }, { isDefault: false })
    }
    await this.repo.update(id, dto)
    return this.findShippingAddress(id, userId, tenantId)
  }

  async setDefaultShippingAddress(id: string, userId: string, tenantId: string) {
    this.logger.log(`${this.setDefaultShippingAddress.name} Service Called`)
    await this.findShippingAddress(id, userId, tenantId)
    await this.repo.update({ userId, tenantId }, { isDefault: false })
    await this.repo.update(id, { isDefault: true })
    return this.findShippingAddress(id, userId, tenantId)
  }

  async removeShippingAddress(id: string, userId: string, tenantId: string) {
    this.logger.log(`${this.removeShippingAddress.name} Service Called`)
    const address = await this.findShippingAddress(id, userId, tenantId)
    await this.repo.remove(address)
    return { success: true, message: 'Shipping address deleted' }
  }
}
