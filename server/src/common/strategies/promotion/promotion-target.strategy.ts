import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity';

export interface PromotionTargetContext {
  productId?: string;
  categoryId?: string;
  brandId?: string;
  cartTotal?: number;
}

export interface PromotionTargetStrategy {
  isApplicable(promotion: PromotionEntity, context: PromotionTargetContext): boolean;
}
