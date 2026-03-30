import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'

@Injectable()
export class ShippingAddressRepository extends Repository<ShippingAddressEntity> {
  constructor(private dataSource: DataSource) {
    super(ShippingAddressEntity, dataSource.createEntityManager())
  }

  async findAllByUserId(userId: string, tenantId: string): Promise<ShippingAddressEntity[]> {
    return await this.find({
      where: { userId, tenantId },
      order: { isDefault: 'DESC' },
    })
  }

  async findById(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<ShippingAddressEntity | null> {
    return await this.findOne({ where: { id, userId, tenantId } })
  }

  async unsetDefaults(userId: string, tenantId: string): Promise<void> {
    await this.update({ userId, tenantId }, { isDefault: false })
  }

  async createAndSave(userId: string, tenantId: string, data: any): Promise<ShippingAddressEntity> {
    const address = this.create({ ...data, userId, tenantId }) as any
    return await this.save(address)
  }

  async updateAndSave(address: ShippingAddressEntity, data: any): Promise<ShippingAddressEntity> {
    Object.assign(address, data)
    return await this.save(address)
  }

  async removeAddress(address: ShippingAddressEntity): Promise<void> {
    await this.softRemove(address)
  }
}
