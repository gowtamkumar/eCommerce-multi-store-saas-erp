import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity';
import { PromotionTargetStrategy, PromotionTargetContext } from './promotion-target.strategy';

export class SpecificBrandPromotionStrategy implements PromotionTargetStrategy {
  isApplicable(promotion: PromotionEntity, context: PromotionTargetContext): boolean {
    return !!promotion.targetId && !!context.brandId && promotion.targetId === context.brandId;
  }
}
