import { IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator'

export class OpenPosShiftDto {
  @IsUUID()
  @IsNotEmpty()
  registerId: string

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  openingBalance: number
}
