import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PromotionTargetType, PromotionType } from '../entities/promotion.entity';

export class CreatePromotionDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(PromotionType)
    promotionType: PromotionType;

    @IsNumber()
    @Min(0)
    @IsOptional()
    value?: number;

    @IsEnum(PromotionTargetType)
    targetType: PromotionTargetType;

    @IsUUID()
    @IsOptional()
    targetId?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minOrderValue?: number;

    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
