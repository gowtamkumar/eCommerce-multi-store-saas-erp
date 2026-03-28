import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { PlatformSettingsEntity } from './entities/platform-settings.entity'

@Injectable()
export class PlatformSettingsRepository extends Repository<PlatformSettingsEntity> {
  constructor(private dataSource: DataSource) {
    super(PlatformSettingsEntity, dataSource.createEntityManager())
  }

  async findSettings(): Promise<PlatformSettingsEntity | null> {
    return await this.findOne({ where: {} })
  }

  async createDefaultSettings(): Promise<PlatformSettingsEntity> {
    const settings = this.create({
      brandName: 'YourSaaS',
      brandLogo: '',
      supportEmail: 'support@yoursaas.com',
      hero: {
        badge: 'Next-Gen eCommerce Platform',
        title: 'Launch Your Store in Seconds, Not Days',
        description:
          'The all-in-one multi-tenant platform for ambitious sellers. Manage orders, inventory, and customers across multiple stores with a single dashboard.',
        primaryBtnText: 'Start Your Free Trial',
        primaryBtnLink: '/create-store',
        secondaryBtnText: 'Watch Demo',
        secondaryBtnLink: '#',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
      },
      features: [
        {
          icon: 'Globe',
          title: 'Multi-Tenant',
          description: 'Run separate stores for different brands or regions with isolated data.',
        },
        {
          icon: 'Zap',
          title: 'Instant Deployment',
          description: 'New stores are live in seconds with their own subdomain automatically.',
        },
        {
          icon: 'Shield',
          title: 'Secure Payments',
          description: 'Pre-integrated with SSLCommerz and more for secure transactions.',
        },
        {
          icon: 'BarChart3',
          title: 'Global Analytics',
          description: 'Monitor sales and customer behavior across all your stores.',
        },
        {
          icon: 'Users',
          title: 'User Management',
          description: 'Role-based access control for your team and store administrators.',
        },
        {
          icon: 'Target',
          title: 'SEO Optimized',
          description: 'Built-in SEO tools to help your products rank higher in search results.',
        },
      ],
      footer: {
        description: 'The ultimate multi-tenant eCommerce platform.',
        copyright: '© 2024 YourSaaS. All rights reserved.',
        socials: {
          facebook: '#',
          twitter: '#',
          instagram: '#',
          linkedin: '#',
        },
      },
    })
    return await this.save(settings)
  }

  async updateAndSave(
    settings: PlatformSettingsEntity,
    data: any,
  ): Promise<PlatformSettingsEntity> {
    Object.assign(settings, data)
    return await this.save(settings)
  }
}
