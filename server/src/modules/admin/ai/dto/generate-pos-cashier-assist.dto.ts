import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const POS_CASHIER_ASSIST_CONTEXTS = ['upsell', 'reconciliation', 'remarks'] as const
export type PosCashierAssistContext = (typeof POS_CASHIER_ASSIST_CONTEXTS)[number]

export class GeneratePosCashierAssistDto {
  @ApiProperty({ enum: POS_CASHIER_ASSIST_CONTEXTS })
  @IsIn(POS_CASHIER_ASSIST_CONTEXTS)
  context: PosCashierAssistContext

  @ApiPropertyOptional({ description: 'List of items in the cart' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  cartSummary?: string

  @ApiPropertyOptional({ description: 'Linked customer profile information' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customerSummary?: string

  @ApiPropertyOptional({ description: 'Active shift metrics and variance' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  shiftSummary?: string

  @ApiPropertyOptional({ description: 'Adjustment details' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  transactionSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class PosCashierAssistResultDto {
  @ApiPropertyOptional({ description: 'Upsell/cross-sell suggestions and reasons' })
  upsellSuggestions?: Array<{
    productSuggest: string
    pitchExplanation: string
  }>

  @ApiPropertyOptional({ description: 'Reconciliation audit checklist steps' })
  reconciliationSteps?: string[]

  @ApiPropertyOptional({ description: 'Suggested professional transaction remark' })
  suggestedRemarks?: string
}
