import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity';
import { PromotionTargetStrategy, PromotionTargetContext } from './promotion-target.strategy';

export class SpecificProductPromotionStrategy implements PromotionTargetStrategy {
  isApplicable(promotion: PromotionEntity, context: PromotionTargetContext): boolean {
    return !!promotion.targetId && !!context.productId && promotion.targetId === context.productId;
  }
}
