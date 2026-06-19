import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GeneratePayslipExplanationDto {
  @ApiProperty({ description: 'Serialized payslip context from admin UI (amounts from DB)' })
  @IsString()
  @MaxLength(6000)
  payslipSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  existingDraft?: string
}

export class PayslipExplanationResultDto {
  @ApiProperty()
  emailSubject: string

  @ApiProperty()
  employeeMessage: string

  @ApiProperty({ type: [String] })
  breakdownBullets: string[]

  @ApiProperty({ type: [String] })
  internalNotes: string[]
}
