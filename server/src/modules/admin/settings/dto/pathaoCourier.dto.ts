import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class PathaoCourierDto {
  @IsString()
  @IsOptional()
  pathaoClientId?: string

  @IsString()
  @IsOptional()
  pathaoClientSecret?: string

  @IsString()
  @IsOptional()
  pathaoUsername?: string

  @IsString()
  @IsOptional()
  pathaoPassword?: string

  @IsString()
  @IsOptional()
  pathaoStoreId?: string

  @IsBoolean()
  @IsOptional()
  sandboxMode?: boolean

  /**
   * Optional HMAC secret used to verify the X-Pathao-Signature header on
   * inbound webhook callbacks. When set, the webhook handler rejects any
   * request whose signature doesn't match HMAC-SHA256(secret, rawBody).
   */
  @IsString()
  @IsOptional()
  webhookSecret?: string
}
