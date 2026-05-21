import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class ManualPointsAdjustmentDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Math.round(Number(value)))
  points: number

  @IsString()
  @IsNotEmpty()
  note: string
}
