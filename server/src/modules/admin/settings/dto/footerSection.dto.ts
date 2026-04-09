import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { NavbarLinkDto } from './navbarLink.dto'

export class FooterSectionDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsNumber()
  @IsOptional()
  order?: number

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NavbarLinkDto)
  links?: NavbarLinkDto[]
}

export class FooterSettingsDto {
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
  brandColor?: string

  @IsOptional()
  @IsString()
  borderColor?: string

  @IsOptional()
  @IsString()
  shadowIntensity?: string

  @IsOptional()
  @IsString()
  borderRadius?: string

  @IsOptional()
  @IsString()
  topShape?: string

  @IsOptional()
  @IsString()
  backgroundPattern?: string

  @IsOptional()
  @IsBoolean()
  glassEffect?: boolean

  @IsOptional()
  @IsString()
  columns?: string

  @IsOptional()
  @IsBoolean()
  showSocialLinks?: boolean

  @IsOptional()
  @IsBoolean()
  showNewsletter?: boolean

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  copyright?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterSectionDto)
  sections?: FooterSectionDto[]
}
