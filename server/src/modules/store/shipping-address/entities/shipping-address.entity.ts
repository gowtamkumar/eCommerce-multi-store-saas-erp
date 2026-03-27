import { BaseEntity } from '@/common/base-entity/BaseEntity';
import { ShippingZoneType } from '@/common/enums/shipping-zone-type';
import { Column, Entity } from 'typeorm';

@Entity('shipping_addresses')
export class ShippingAddressEntity extends BaseEntity {
    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    label: string; // e.g. "Home", "Office"

    @Column({ type: 'varchar', name: 'recipient_name', length: 255 })
    recipientName: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'enum', enum: ShippingZoneType, nullable: true })
    zone: ShippingZoneType;

    @Column({ type: 'boolean', name: 'is_default', default: false })
    isDefault: boolean;
}
