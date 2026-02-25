import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettingsEntity extends BaseEntity {

  @Column({ nullable: true, name: 'brand_name' })
  brandName: string;

  @Column({ nullable: true, name: 'brand_logo' })
  brandLogo: string;

  @Column({ nullable: true, name: 'support_email' })
  supportEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    image: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  footer: {
    description: string;
    copyright: string;
    socials: {
      facebook: string;
      twitter: string;
      instagram: string;
      linkedin: string;
    };
  };


}
