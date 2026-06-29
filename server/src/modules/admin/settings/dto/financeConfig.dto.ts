import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class FinanceConfigDto {
  /**
   * Amount above which a created expense triggers a high-expense notification
   * to tenant administrators. Defaults to 1000 in the expense service if unset.
   */
  @IsNumber()
  @IsOptional()
  highExpenseNotifyThreshold?: number

  @IsString()
  @IsOptional()
  taxProvider?: string

  @IsString()
  @IsOptional()
  taxApiKey?: string

  @IsString()
  @IsOptional()
  taxMode?: string

  @IsNumber()
  @IsOptional()
  hrmStandardMonthlyHours?: number

  @IsNumber()
  @IsOptional()
  hrmOvertimeMultiplier?: number

  @IsNumber()
  @IsOptional()
  hrmLateDeductionMultiplier?: number

  @IsBoolean()
  @IsOptional()
  hrmGeofencingEnabled?: boolean

  @IsNumber()
  @IsOptional()
  hrmGeofencingRadiusMeters?: number
}
