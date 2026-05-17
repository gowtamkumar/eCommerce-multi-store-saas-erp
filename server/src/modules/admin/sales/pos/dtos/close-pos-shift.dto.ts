import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator'

export class ClosePosShiftDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  closingBalance: number

  @IsString()
  @IsOptional()
  remarks?: string
}
