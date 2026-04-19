import { Expose } from 'class-transformer';
import { ShippingZoneType } from '@/common/enums/shipping-zone-type.enum';

export class ShippingAddressResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId?: string | null;

  @Expose()
  tenantId: string;

  @Expose()
  label: string;

  @Expose()
  recipientName: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  city: string;

  @Expose()
  zone: ShippingZoneType;

  @Expose()
  isDefault: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
