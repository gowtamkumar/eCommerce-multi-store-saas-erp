import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ShippingZoneType } from '@/common/enums/shipping-zone-type.enum'
import { Column, Entity } from 'typeorm'

@Entity('shipping_addresses')
export class ShippingAddressEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string // e.g. "Home", "Office"

  @Column({ type: 'varchar', name: 'recipient_name', length: 255 })
  recipientName: string

  @Column({ type: 'varchar', length: 20 })
  phone: string

  @Column({ type: 'text' })
  address: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string

  @Column({ type: 'enum', enum: ShippingZoneType, nullable: true })
  zone: ShippingZoneType

  @Column({ type: 'varchar', length: 100, default: 'BD' })
  country: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string

  @Column({ type: 'varchar', name: 'postal_code', length: 20, nullable: true })
  postalCode: string

  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault: boolean
}
