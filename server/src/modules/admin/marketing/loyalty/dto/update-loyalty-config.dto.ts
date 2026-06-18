import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class UpdateLoyaltyConfigDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  pointsPerCurrencySpent?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Math.round(Number(value)))
  pointsRequiredPerCurrencyDiscount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  silverTierThreshold?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  goldTierThreshold?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  platinumTierThreshold?: number

  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Transform(({ value }) => Number(value))
  silverMultiplier?: number

  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Transform(({ value }) => Number(value))
  goldMultiplier?: number

  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Transform(({ value }) => Number(value))
  platinumMultiplier?: number

  @IsOptional()
  @IsEnum(['WALLET', 'POINTS'])
  referralRewardType?: 'WALLET' | 'POINTS'

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  referralRewardAmount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  refereeMinPurchase?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => (value === null ? null : Math.round(Number(value))))
  pointsExpireAfterDays?: number | null

  @IsOptional()
  @IsString()
  programDescription?: string | null

  @IsOptional()
  @IsString()
  referralMessage?: string | null
}
