import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AddonCatalogEntity } from './entities/addon-catalog.entity'

@Injectable()
export class AddonCatalogRepository {
  constructor(
    @InjectRepository(AddonCatalogEntity)
    private readonly repo: Repository<AddonCatalogEntity>,
  ) {}

  async findAll(): Promise<AddonCatalogEntity[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } })
  }

  async findActive(): Promise<AddonCatalogEntity[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    })
  }

  async findBySlug(slug: string): Promise<AddonCatalogEntity | null> {
    return this.repo.findOne({ where: { slug } })
  }

  async findById(id: string): Promise<AddonCatalogEntity | null> {
    return this.repo.findOne({ where: { id } })
  }

  async createAndSave(data: Partial<AddonCatalogEntity>): Promise<AddonCatalogEntity> {
    const addon = this.repo.create(data)
    return this.repo.save(addon)
  }

  async updateAndSave(
    addon: AddonCatalogEntity,
    data: Partial<AddonCatalogEntity>,
  ): Promise<AddonCatalogEntity> {
    Object.assign(addon, data)
    return this.repo.save(addon)
  }

  async remove(addon: AddonCatalogEntity): Promise<void> {
    await this.repo.remove(addon)
  }

  /** Returns active slug set for validation — includes base slug only */
  async getActiveSlugs(): Promise<string[]> {
    const addons = await this.findActive()
    return addons.map((a) => a.slug)
  }
}
