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
    priceBookCode: string,
    tenantId: string,
  ) {
    const pb = await this.priceBookRepo.findOne({
      where: { code: priceBookCode, tenantId, isActive: true },
    })

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

    return applicablePrice ? applicablePrice.price : null
  }

  async findAllPriceBooks(ctx: RequestContextDto) {
    return await this.priceBookRepo.find({
      where: { tenantId: ctx.tenantId },
      order: { createdAt: 'DESC' },
    })
  }
}
