import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity'
import { PromotionTargetStrategy, PromotionTargetContext } from './promotion-target.strategy'

export class EntireOrderPromotionStrategy implements PromotionTargetStrategy {
  isApplicable(promotion: PromotionEntity, context: PromotionTargetContext): boolean {
    return true
  }
}
