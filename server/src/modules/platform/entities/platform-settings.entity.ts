import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @UpdateDateColumn()
  updatedAt: Date;
}
