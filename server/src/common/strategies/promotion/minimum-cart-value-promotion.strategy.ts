import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity'
import { PromotionTargetStrategy, PromotionTargetContext } from './promotion-target.strategy'

export class MinimumCartValuePromotionStrategy implements PromotionTargetStrategy {
  isApplicable(promotion: PromotionEntity, context: PromotionTargetContext): boolean {
    return (
      !!promotion.minOrderValue &&
      !!context.cartTotal &&
      context.cartTotal >= promotion.minOrderValue
    )
  }
}
