import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class NavbarLinkDto {
  @IsString()
  @IsOptional()
  label?: string

  @IsString()
  @IsOptional()
  href?: string

  @IsNumber()
  @IsOptional()
  order?: number

  @IsBoolean()
  @IsOptional()
  isOpenInNewTab?: boolean

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class NavbarSettingsDto {
  @IsOptional()
  @IsString()
  layout?: string

  @IsOptional()
  @IsString()
  template?: string

  @IsOptional()
  @IsString()
  backgroundColor?: string

  @IsOptional()
  @IsString()
  textColor?: string

  @IsOptional()
  @IsString()
  shadowIntensity?: string

  @IsOptional()
  @IsString()
  hoverEffect?: string

  @IsOptional()
  @IsString()
  borderRadius?: string

  @IsOptional()
  @IsBoolean()
  sticky?: boolean

  @IsOptional()
  @IsString()
  maxWidth?: string

  @IsOptional()
  @IsString()
  bottomShape?: string

  @IsOptional()
  @IsString()
  backgroundPattern?: string

  @IsOptional()
  @IsBoolean()
  transparent?: boolean

  @IsOptional()
  @IsBoolean()
  showCurrency?: boolean

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavbarLinkDto)
  links?: NavbarLinkDto[]
}
