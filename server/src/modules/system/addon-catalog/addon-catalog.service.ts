import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { AddonCatalogRepository } from './addon-catalog.repository'
import { AddonCatalogEntity } from './entities/addon-catalog.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

const ADDON_CATALOG_CACHE_KEY = 'addon_catalog:active'

@Injectable()
export class AddonCatalogService {
  private readonly logger = new Logger(AddonCatalogService.name)

  constructor(
    private readonly addonRepo: AddonCatalogRepository,
    private readonly cacheService: CacheService,
  ) {}

  /** Get all addons (superadmin use) */
  async findAll(): Promise<AddonCatalogEntity[]> {
    return this.addonRepo.findAll()
  }

  /** Get active addons (tenant-facing use) — cached 24h */
  async findActive(): Promise<AddonCatalogEntity[]> {
    return this.cacheService.rememberCache(
      ADDON_CATALOG_CACHE_KEY,
      () => this.addonRepo.findActive(),
      86400,
    )
  }

  async findById(id: string): Promise<AddonCatalogEntity> {
    const addon = await this.addonRepo.findById(id)
    if (!addon) throw new NotFoundException(`Addon with ID "${id}" not found`)
    return addon
  }

  private generateSlug(name?: string, providedSlug?: string): string {
    let slug = providedSlug
    if (!slug || slug.trim() === '') {
      if (!name || name.trim() === '') {
        throw new BadRequestException('Addon name is required to auto-generate a slug.')
      }
      const nameSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '')
      slug = nameSlug.startsWith('addon_') ? nameSlug : `addon_${nameSlug}`
    } else {
      slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '')
      if (!slug.startsWith('addon_')) {
        slug = `addon_${slug}`
      }
    }
    return slug
  }

  async create(data: Partial<AddonCatalogEntity>): Promise<AddonCatalogEntity> {
    data.slug = this.generateSlug(data.name, data.slug)
    this.logger.log(`Creating addon: ${data.slug}`)
    // Validate slug uniqueness
    const existing = await this.addonRepo.findBySlug(data.slug)
    if (existing) throw new BadRequestException(`Addon with slug "${data.slug}" already exists`)
    const addon = await this.addonRepo.createAndSave(data)
    await this.invalidateCache()
    return addon
  }

  async update(id: string, data: Partial<AddonCatalogEntity>): Promise<AddonCatalogEntity> {
    this.logger.log(`Updating addon ID: ${id}`)
    const addon = await this.findById(id)

    // If slug or name is modified, handle slug regeneration/uniqueness check
    if (data.slug !== undefined || data.name !== undefined) {
      const targetSlug = data.slug !== undefined ? data.slug : addon.slug
      const targetName = data.name !== undefined ? data.name : addon.name
      const processedSlug = this.generateSlug(targetName, targetSlug)

      if (processedSlug !== addon.slug) {
        const existing = await this.addonRepo.findBySlug(processedSlug)
        if (existing) throw new BadRequestException(`Addon with slug "${processedSlug}" already exists`)
      }
      data.slug = processedSlug
    }

    const updated = await this.addonRepo.updateAndSave(addon, data)
    await this.invalidateCache()
    return updated
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing addon ID: ${id}`)
    const addon = await this.findById(id)
    await this.addonRepo.remove(addon)
    await this.invalidateCache()
  }

  /** Validate that a slug (possibly suffixed like addon_storage_5gb_1) refers to an active addon */
  async isValidAddonSlug(slug: string): Promise<boolean> {
    const active = await this.findActive()
    return active.some((a) => slug === a.slug || slug.startsWith(a.slug + '_'))
  }

  /** Get active storage addon definitions (boost_unit === 'mb') */
  async getStorageAddons(): Promise<AddonCatalogEntity[]> {
    const active = await this.findActive()
    return active.filter((a) => a.boostUnit === 'mb')
  }

  /** Seed default addons — safe to run multiple times (upsert by slug) */
  async seedDefaults(): Promise<void> {
    this.logger.log('Seeding default addon catalog entries')
    const defaults: Partial<AddonCatalogEntity>[] = [
      {
        slug: 'addon_storage_5gb',
        name: 'Lite Storage Boost',
        description: 'Perfect for small stores uploading standard product photos and documents.',
        category: 'storage',
        boostLabel: '+5 GB Storage',
        boostValue: 5120,
        boostUnit: 'mb',
        price: 5,
        icon: 'HardDrive',
        features: ['5,120 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'addon_storage_10gb',
        name: 'Growth Storage Boost',
        description: 'Ideal for growing businesses with rich catalogs and product collections.',
        category: 'storage',
        boostLabel: '+10 GB Storage',
        boostValue: 10240,
        boostUnit: 'mb',
        price: 9,
        icon: 'HardDrive',
        features: ['10,240 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        isActive: true,
        sortOrder: 2,
      },
      {
        slug: 'addon_storage_20gb',
        name: 'Pro Storage Boost',
        description: 'Designed for large retailers with thousands of high-res photos and receipts.',
        category: 'storage',
        boostLabel: '+20 GB Storage',
        boostValue: 20480,
        boostUnit: 'mb',
        price: 15,
        icon: 'HardDrive',
        features: ['20,480 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        isActive: true,
        sortOrder: 3,
      },
      {
        slug: 'addon_products_1000',
        name: 'Catalog Boost',
        description: 'Expand your catalog capacity by adding 1,000 more products and variations.',
        category: 'resource',
        boostLabel: '+1,000 SKUs',
        boostValue: 1000,
        boostUnit: 'products',
        price: 15,
        icon: 'Package',
        features: ['1,000 product capability', 'Immediate synchronization', 'Plan-independent override', 'One-off activation'],
        isActive: true,
        sortOrder: 4,
      },
      {
        slug: 'addon_orders_5000',
        name: 'Transactions Boost',
        description: 'Increase monthly order limits by 5,000/mo to handle sales spikes and campaigns.',
        category: 'resource',
        boostLabel: '+5,000 Orders/Mo',
        boostValue: 5000,
        boostUnit: 'orders',
        price: 25,
        icon: 'ShoppingCart',
        features: ['5,000 extra monthly orders', 'Dynamic threshold update', 'Prevents checkout locks', 'One-off activation'],
        isActive: true,
        sortOrder: 5,
      },
      {
        slug: 'addon_staff_10',
        name: 'Collaborators Boost',
        description: 'Invite up to 10 additional staff members, managers, or warehouse assistants.',
        category: 'resource',
        boostLabel: '+10 Staff Accounts',
        boostValue: 10,
        boostUnit: 'staff',
        price: 20,
        icon: 'Users',
        features: ['10 team accounts', 'Granular role assignments', 'Global branch scoping', 'One-off activation'],
        isActive: true,
        sortOrder: 6,
      },
      {
        slug: 'addon_locations_3',
        name: 'Logistics Expansion Boost',
        description: 'Add 3 branches and 3 warehouses to expand physical operations and supply chain.',
        category: 'resource',
        boostLabel: '+3 Loc / WH',
        boostValue: 3,
        boostUnit: 'locations',
        price: 35,
        icon: 'MapPin',
        features: ['3 physical branches', '3 warehouse inventories', 'Multi-source stock routing', 'One-off activation'],
        isActive: true,
        sortOrder: 7,
      },
    ]

    for (const data of defaults) {
      const existing = await this.addonRepo.findBySlug(data.slug!)
      if (!existing) {
        await this.addonRepo.createAndSave(data)
        this.logger.log(`Seeded addon: ${data.slug}`)
      }
    }
    await this.invalidateCache()
  }

  private async invalidateCache(): Promise<void> {
    await this.cacheService.delCache(ADDON_CATALOG_CACHE_KEY)
  }
}
