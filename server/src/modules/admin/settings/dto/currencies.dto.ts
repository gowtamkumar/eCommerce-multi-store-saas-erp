import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CurrenciesDto {
  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  symbol?: string

  @IsNumber()
  @IsOptional()
  rate?: number

  @IsString()
  @IsOptional()
  name?: string
}
