import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ShippingAddressEntity } from './entities/shipping-address.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ShippingAddressRepository {
  constructor(
    @InjectRepository(ShippingAddressEntity)
    private readonly repo: Repository<ShippingAddressEntity>,
  ) { }

  async findAllByUserId(userId: string, tenantId: string): Promise<ShippingAddressEntity[]> {
    return await this.repo.find({
      where: { userId, tenantId },
      order: { isDefault: 'DESC' },
    })
  }

  async findById(
    id: string,
    userId: string,
    tenantId: string,
  ): Promise<ShippingAddressEntity | null> {
    return await this.repo.findOne({ where: { id, userId, tenantId } })
  }

  async unsetDefaults(userId: string, tenantId: string): Promise<void> {
    await this.repo.update({ userId, tenantId }, { isDefault: false })
  }

  async createAndSave(data: any, ctx: RequestContextDto): Promise<ShippingAddressEntity> {
    const address = this.repo.create({ ...data, userId: ctx.userId, tenantId: ctx.tenantId }) as any
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
