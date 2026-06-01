import { IsNumber, IsOptional } from 'class-validator'

export class FinanceConfigDto {
  /**
   * Amount above which a created expense triggers a high-expense notification
   * to tenant administrators. Defaults to 1000 in the expense service if unset.
   */
  @IsNumber()
  @IsOptional()
  highExpenseNotifyThreshold?: number
}
