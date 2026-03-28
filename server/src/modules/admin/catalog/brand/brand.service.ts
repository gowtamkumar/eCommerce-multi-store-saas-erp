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
    const existing = await this.brandRepo.findOne({
      where: { slug: createBrandDto.slug, tenantId },
    })

    if (existing) {
      throw new ConflictException('Brand with this slug already exists')
    }

    const brand = this.brandRepo.create({
      ...createBrandDto,
      tenantId,
    })

    return await this.brandRepo.save(brand)
  }

  async findAllBrands(tenantId: string) {
    this.logger.log(`${this.findAllBrands.name} Service Called`)
    return await this.brandRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    })
  }

  async findOneBrand(id: string, tenantId: string) {
    this.logger.log(`${this.findOneBrand.name} Service Called`)
    const brand = await this.brandRepo.findOne({
      where: { id, tenantId },
    })

    if (!brand) {
      throw new NotFoundException('Brand not found')
    }

    return brand
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto, tenantId: string) {
    this.logger.log(`${this.updateBrand.name} Service Called`)
    const brand = await this.findOneBrand(id, tenantId)

    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      const existing = await this.brandRepo.findOne({
        where: { slug: updateBrandDto.slug, tenantId },
      })

      if (existing) {
        throw new ConflictException('Brand with this slug already exists')
      }
    }

    Object.assign(brand, updateBrandDto)
    return await this.brandRepo.save(brand)
  }

  async removeBrand(id: string, tenantId: string) {
    this.logger.log(`${this.removeBrand.name} Service Called`)
    const brand = await this.findOneBrand(id, tenantId)
    await this.brandRepo.remove(brand)
    return { success: true, message: 'Brand deleted successfully' }
  }
}
