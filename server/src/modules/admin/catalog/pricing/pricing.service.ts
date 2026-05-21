import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PriceBookEntity } from './entities/price-book.entity'
import { ProductPriceEntity } from './entities/product-price.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PriceBookEntity)
    private readonly priceBookRepo: Repository<PriceBookEntity>,
    @InjectRepository(ProductPriceEntity)
    private readonly productPriceRepo: Repository<ProductPriceEntity>,
  ) {}

  async createPriceBook(data: any, ctx: RequestContextDto) {
    const pb = this.priceBookRepo.create({
      ...data,
      tenantId: ctx.tenantId,
    })
    return await this.priceBookRepo.save(pb)
  }

  async addProductPrice(data: any, ctx: RequestContextDto) {
    const pp = this.productPriceRepo.create({
      ...data,
      tenantId: ctx.tenantId,
    })
    return await this.productPriceRepo.save(pp)
  }

  /**
   * Finds the applicable price for a product/variant based on quantity.
   * This is used by the Cart and Checkout modules.
   */
  async getApplicablePrice(
    productId: string,
    variantId: string | null,
    quantity: number,
    priceBookCode: string | null | undefined,
    tenantId: string,
  ) {
    let pb = null
    if (priceBookCode) {
      pb = await this.priceBookRepo.findOne({
        where: { code: priceBookCode, tenantId, isActive: true },
      })
    }

    if (!pb) {
      pb = await this.priceBookRepo.findOne({
        where: { tenantId, isActive: true },
        order: { createdAt: 'ASC' },
      })
    }

    if (!pb) return null

    const prices = await this.productPriceRepo.find({
      where: {
        priceBookId: pb.id,
        productId,
        variantId: variantId || undefined,
        tenantId,
      },
      order: { minQuantity: 'DESC' }, // Get highest minQuantity first
    })

    // Find the first price where quantity >= minQuantity
    const applicablePrice = prices.find((p) => quantity >= p.minQuantity)

    return applicablePrice ? Number(applicablePrice.price) : null
  }

  async findAllPriceBooks(ctx: RequestContextDto) {
    return await this.priceBookRepo.find({
      where: { tenantId: ctx.tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findProductPrices(productId: string, ctx: RequestContextDto) {
    return await this.productPriceRepo.find({
      where: { productId, tenantId: ctx.tenantId },
      relations: ['priceBook', 'variant'],
      order: { minQuantity: 'ASC' },
    })
  }

  async deleteProductPrice(id: string, ctx: RequestContextDto) {
    const pp = await this.productPriceRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })
    if (!pp) throw new NotFoundException('Product price tier not found')
    return await this.productPriceRepo.remove(pp)
  }

  async updatePriceBook(id: string, data: any, ctx: RequestContextDto) {
    const pb = await this.priceBookRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })
    if (!pb) throw new NotFoundException('Price book not found')
    Object.assign(pb, data)
    return await this.priceBookRepo.save(pb)
  }

  async deletePriceBook(id: string, ctx: RequestContextDto) {
    const pb = await this.priceBookRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })
    if (!pb) throw new NotFoundException('Price book not found')
    return await this.priceBookRepo.remove(pb)
  }
}
