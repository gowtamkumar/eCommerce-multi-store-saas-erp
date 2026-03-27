import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class SmtpDto {
  @IsString()
  @IsOptional()
  host?: string

  @IsNumber()
  @IsOptional()
  port?: number

  @IsBoolean()
  @IsOptional()
  secure?: boolean

  @IsString()
  @IsOptional()
  user?: string

  @IsString()
  @IsOptional()
  pass: string

  @IsString()
  @IsOptional()
  from: string
}
