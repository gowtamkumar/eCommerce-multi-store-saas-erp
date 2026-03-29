import { Expose } from 'class-transformer';

export class PlatformSettingsResponseDto {
  @Expose()
  id: string;

  @Expose()
  brandName: string;

  @Expose()
  brandLogo: string;

  @Expose()
  supportEmail: string;

  @Expose()
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

  @Expose()
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  @Expose()
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

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
