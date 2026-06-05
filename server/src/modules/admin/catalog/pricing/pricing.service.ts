import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual, Or, Not, In } from 'typeorm'
import { PriceBookEntity } from './entities/price-book.entity'
import { ProductPriceEntity } from './entities/product-price.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PriceBookType } from './enums/price-book-type.enum'

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PriceBookEntity)
    private readonly priceBookRepo: Repository<PriceBookEntity>,
    @InjectRepository(ProductPriceEntity)
    private readonly productPriceRepo: Repository<ProductPriceEntity>,
  ) {}

  private async validatePriceBook(data: any, tenantId: string, excludeId?: string) {
    const { type, validFrom, validTo, isActive, currency } = data

    // 1. Promotional validations: dates must exist and validTo > validFrom
    if (type === PriceBookType.PROMOTIONAL) {
      if (!validFrom || !validTo) {
        throw new BadRequestException(
          'Promotional price books require both Valid From and Valid To dates.',
        )
      }
      const fromDate = new Date(validFrom)
      const toDate = new Date(validTo)
      if (toDate <= fromDate) {
        throw new BadRequestException(
          'Valid To date must be chronologically after the Valid From date.',
        )
      }
    }

    // 2. Retail validations: only one active RETAIL price book per currency
    if (type === PriceBookType.RETAIL && isActive) {
      const conflictingWhere: any = {
        tenantId,
        type: PriceBookType.RETAIL,
        isActive: true,
        currency: currency || 'BDT',
      }
      if (excludeId) {
        conflictingWhere.id = Not(excludeId)
      }
      const conflictingBook = await this.priceBookRepo.findOne({
        where: conflictingWhere,
      })

      if (conflictingBook) {
        throw new BadRequestException(
          `An active RETAIL price book for currency ${currency || 'BDT'} already exists ("${conflictingBook.name}"). Only one active RETAIL book is allowed per currency.`,
        )
      }
    }
  }

  async createPriceBook(data: any, ctx: RequestContextDto) {
    await this.validatePriceBook(data, ctx.tenantId)

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
   * Resolves the applicable price book for a tenant given an optional explicit
   * code, falling back to the active PROMOTIONAL then RETAIL book. The result
   * does not depend on any product, so it can be resolved once for many items.
   */
  private async resolvePriceBook(
    priceBookCode: string | null | undefined,
    tenantId: string,
    now: Date,
  ): Promise<PriceBookEntity | null> {
    let pb: PriceBookEntity | null = null

    // 1. If explicit priceBookCode is passed, look up that specific active book (of any type)
    if (priceBookCode) {
      pb = await this.priceBookRepo.findOne({
        where: [
          // Active book with no date constraints
          { code: priceBookCode, tenantId, isActive: true, validFrom: IsNull(), validTo: IsNull() },
          // Active book: validFrom set, validTo not set
          {
            code: priceBookCode,
            tenantId,
            isActive: true,
            validFrom: LessThanOrEqual(now),
            validTo: IsNull(),
          },
          // Active book: validFrom not set, validTo set
          {
            code: priceBookCode,
            tenantId,
            isActive: true,
            validFrom: IsNull(),
            validTo: MoreThanOrEqual(now),
          },
          // Active book: both dates set and within range
          {
            code: priceBookCode,
            tenantId,
            isActive: true,
            validFrom: LessThanOrEqual(now),
            validTo: MoreThanOrEqual(now),
          },
        ],
      })
    }

    // 2. If no code is passed (or requested one not found), resolve by priority:
    //    Priority A: Active PROMOTIONAL price book matching current time
    if (!pb) {
      pb = await this.priceBookRepo.findOne({
        where: [
          {
            tenantId,
            type: PriceBookType.PROMOTIONAL,
            isActive: true,
            validFrom: IsNull(),
            validTo: IsNull(),
          },
          {
            tenantId,
            type: PriceBookType.PROMOTIONAL,
            isActive: true,
            validFrom: LessThanOrEqual(now),
            validTo: IsNull(),
          },
          {
            tenantId,
            type: PriceBookType.PROMOTIONAL,
            isActive: true,
            validFrom: IsNull(),
            validTo: MoreThanOrEqual(now),
          },
          {
            tenantId,
            type: PriceBookType.PROMOTIONAL,
            isActive: true,
            validFrom: LessThanOrEqual(now),
            validTo: MoreThanOrEqual(now),
          },
        ],
        order: { createdAt: 'DESC' }, // Pick newest promotion if multiple exist
      })
    }

    //    Priority B: Active RETAIL price book
    if (!pb) {
      pb = await this.priceBookRepo.findOne({
        where: [
          {
            tenantId,
            type: PriceBookType.RETAIL,
            isActive: true,
            validFrom: IsNull(),
            validTo: IsNull(),
          },
          {
            tenantId,
            type: PriceBookType.RETAIL,
            isActive: true,
            validFrom: LessThanOrEqual(now),
            validTo: IsNull(),
          },
          {
            tenantId,
            type: PriceBookType.RETAIL,
            isActive: true,
            validFrom: IsNull(),
            validTo: MoreThanOrEqual(now),
          },
          {
            tenantId,
            type: PriceBookType.RETAIL,
            isActive: true,
            validFrom: LessThanOrEqual(now),
            validTo: MoreThanOrEqual(now),
          },
        ],
        order: { createdAt: 'ASC' },
      })
    }

    return pb
  }

  /**
   * Picks the applicable tier from a pre-loaded list of product prices using the
   * same rules as the DB query (highest minQuantity satisfied by quantity, with
   * variant-specific tiers taking precedence over base tiers).
   */
  private pickApplicableTier(
    prices: ProductPriceEntity[],
    productId: string,
    variantId: string | null,
    quantity: number,
  ): number | null {
    let applicablePrice: ProductPriceEntity | undefined

    if (variantId) {
      applicablePrice = prices.find(
        (p) =>
          p.productId === productId && p.variantId === variantId && quantity >= p.minQuantity,
      )
    }

    if (!applicablePrice) {
      applicablePrice = prices.find(
        (p) => p.productId === productId && p.variantId == null && quantity >= p.minQuantity,
      )
    }

    return applicablePrice ? Number(applicablePrice.price) : null
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
    const now = new Date()
    const pb = await this.resolvePriceBook(priceBookCode, tenantId, now)
    if (!pb) return null

    let applicablePrice = null

    // 1. Try to find variant-specific price first if variantId is provided
    if (variantId) {
      const variantPrices = await this.productPriceRepo.find({
        where: {
          priceBookId: pb.id,
          productId,
          variantId,
          tenantId,
        },
        order: { minQuantity: 'DESC' },
      })
      applicablePrice = variantPrices.find((p) => quantity >= p.minQuantity)
    }

    // 2. Fall back to base product price if no variant price found
    if (!applicablePrice) {
      const basePrices = await this.productPriceRepo.find({
        where: {
          priceBookId: pb.id,
          productId,
          variantId: IsNull(),
          tenantId,
        },
        order: { minQuantity: 'DESC' },
      })
      applicablePrice = basePrices.find((p) => quantity >= p.minQuantity)
    }

    return applicablePrice ? Number(applicablePrice.price) : null
  }

  /**
   * Bulk variant of getApplicablePrice: resolves prices for many cart/checkout
   * items using a single price-book resolution and a single product-price query
   * (avoids the per-item N+1 that getApplicablePrice incurs in a loop).
   *
   * Returns a map keyed by `${productId}:${variantId ?? ''}` -> price | null.
   */
  async getApplicablePrices(
    items: { productId: string; variantId: string | null; quantity: number }[],
    priceBookCode: string | null | undefined,
    tenantId: string,
  ): Promise<Map<string, number | null>> {
    const result = new Map<string, number | null>()
    if (items.length === 0) return result

    const keyOf = (productId: string, variantId: string | null) =>
      `${productId}:${variantId ?? ''}`

    const now = new Date()
    const pb = await this.resolvePriceBook(priceBookCode, tenantId, now)
    if (!pb) {
      for (const item of items) result.set(keyOf(item.productId, item.variantId), null)
      return result
    }

    const productIds = [...new Set(items.map((i) => i.productId))]
    // Single query for every tier across all requested products. Ordered by
    // minQuantity DESC so pickApplicableTier selects the highest satisfied tier.
    const prices = await this.productPriceRepo.find({
      where: { priceBookId: pb.id, productId: In(productIds), tenantId },
      order: { minQuantity: 'DESC' },
    })

    for (const item of items) {
      result.set(
        keyOf(item.productId, item.variantId),
        this.pickApplicableTier(prices, item.productId, item.variantId, item.quantity),
      )
    }
    return result
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
      relations: {
        priceBook: true,
        variant: true,
      },
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

    const mergedData = { ...pb, ...data }
    await this.validatePriceBook(mergedData, ctx.tenantId, id)

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
