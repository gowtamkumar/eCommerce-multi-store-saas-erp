import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ShippingAddressRepository extends BaseStoreRepository<ShippingAddressEntity> {
  constructor(
    @InjectRepository(ShippingAddressEntity)
    repo: Repository<ShippingAddressEntity>,
  ) {
    super(ShippingAddressEntity, repo)
}

  async findAllByUserId(userId: string, storeId: string): Promise<ShippingAddressEntity[]> {
    return await this.repo.find({
      where: { userId, storeId },
      order: { isDefault: 'DESC' },
    })
  }

  async findById(
    id: string,
    userId: string,
    storeId: string,
  ): Promise<ShippingAddressEntity | null> {
    return await this.repo.findOne({ where: { id, userId, storeId } })
  }

  async unsetDefaults(userId: string, storeId: string): Promise<void> {
    await this.repo.update({ userId, storeId }, { isDefault: false })
  }

  async createAndSave(data: any, ctx: RequestContextDto): Promise<ShippingAddressEntity> {
    const address = this.repo.create({ ...data, userId: ctx.userId, storeId: ctx.storeId }) as any
    return await this.repo.save(address)
  }

  async updateAndSave(address: ShippingAddressEntity, data: any): Promise<ShippingAddressEntity> {
    Object.assign(address, data)
    return await this.repo.save(address)
  }

  async removeAddress(address: ShippingAddressEntity): Promise<void> {
    await this.repo.softRemove(address)
  }
}
