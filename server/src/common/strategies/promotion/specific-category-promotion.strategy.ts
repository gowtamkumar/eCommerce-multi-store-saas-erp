import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity';
import { PromotionTargetStrategy, PromotionTargetContext } from './promotion-target.strategy';

export class SpecificCategoryPromotionStrategy implements PromotionTargetStrategy {
  isApplicable(promotion: PromotionEntity, context: PromotionTargetContext): boolean {
    return !!promotion.targetId && !!context.categoryId && promotion.targetId === context.categoryId;
  }
}
