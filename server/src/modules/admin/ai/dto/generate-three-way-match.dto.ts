import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class GenerateThreeWayMatchDto {
  @IsNotEmpty()
  @IsString()
  invoiceId: string

  @IsOptional()
  @IsString()
  tone?: string
}

export class ThreeWayMatchExplanationResultDto {
  explanationText: string
  discrepancies: string[]
  matchStatus: 'MATCHED' | 'DISCREPANCY'
}
