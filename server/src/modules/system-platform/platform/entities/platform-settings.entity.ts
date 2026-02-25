import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
