import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export enum LoyaltyRuleType {
  CATEGORY_MULTIPLIER = 'CATEGORY_MULTIPLIER',
  WEEKEND_MULTIPLIER = 'WEEKEND_MULTIPLIER',
  MIN_SPEND_BONUS = 'MIN_SPEND_BONUS',
}

/**
 * DTO for creating/updating dynamic loyalty earn rules.
 *
 * `conditions` schema is rule-type-specific:
 *   - CATEGORY_MULTIPLIER → `{ categoryIds: string[] }`
 *   - WEEKEND_MULTIPLIER  → `{}`
 *   - MIN_SPEND_BONUS     → `{ minSpend: number }`
 *
 * The runtime evaluator tolerates legacy single-id shapes, but new entries
 * created through this DTO are normalized to arrays.
 */
export class LoyaltyRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string

  @IsEnum(LoyaltyRuleType)
  type: LoyaltyRuleType

  /**
   * Multiplier (e.g. 2.0 = 2x points) for *_MULTIPLIER rules, or flat point
   * bonus (e.g. 500 = +500 pts) for MIN_SPEND_BONUS.
   */
  @IsNumber()
  @Min(0)
  @Max(10_000)
  @Type(() => Number)
  value: number

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  /**
   * Higher priority rules win when multiple match. Optional; defaults to 0.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  priority?: number
}
