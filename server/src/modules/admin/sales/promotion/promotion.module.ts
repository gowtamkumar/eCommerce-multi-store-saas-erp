import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { PromotionEntity } from './entities/promotion.entity';
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity, ProductEntity])],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule { }
