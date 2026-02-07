import { IsOptional, IsString } from "class-validator";

export class MarketingDto {

  @IsString()
  @IsOptional()
  googleAnalyticsId?: string;

  @IsString()
  @IsOptional()
  googleSiteVerification?: string;

  @IsString()
  @IsOptional()
  facebookPixelId?: string;

  @IsString()
  @IsOptional()
  facebookDomainVerification?: string;
}