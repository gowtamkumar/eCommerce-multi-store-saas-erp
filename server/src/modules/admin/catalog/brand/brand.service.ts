import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { BrandRepository } from './brand.repository'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name)

  constructor(
    private readonly brandRepo: BrandRepository,
  ) {}

  async createBrand(createBrandDto: CreateBrandDto, tenantId: string) {
    this.logger.log(`${this.createBrand.name} Service Called`)
    const existing = await this.brandRepo.findBySlug(createBrandDto.slug, tenantId)

    if (existing) {
      throw new ConflictException('Brand with this slug already exists')
    }

    return await this.brandRepo.createAndSave({
      ...createBrandDto,
      tenantId,
    })
  }

  async findAllBrands(tenantId: string) {
    this.logger.log(`${this.findAllBrands.name} Service Called`)
    return await this.brandRepo.findAllByTenant(tenantId)
  }

  async findOneBrand(id: string, tenantId: string) {
    this.logger.log(`${this.findOneBrand.name} Service Called`)
    const brand = await this.brandRepo.findById(id, tenantId)

    if (!brand) {
      throw new NotFoundException('Brand not found')
    }

    return brand
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto, tenantId: string) {
    this.logger.log(`${this.updateBrand.name} Service Called`)
    const brand = await this.findOneBrand(id, tenantId)

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existing = await this.brandRepo.findBySlug(updateBrandDto.slug, tenantId)

      if (existing) {
        throw new ConflictException('Brand with this slug already exists')
      }
    }

    return await this.brandRepo.updateAndSave(brand, updateBrandDto)
  }

  async removeBrand(id: string, tenantId: string) {
    this.logger.log(`${this.removeBrand.name} Service Called`)
    const brand = await this.findOneBrand(id, tenantId)
    await this.brandRepo.removeBrand(brand)
    return { success: true, message: 'Brand deleted successfully' }
  }
}
