import { IsOptional, IsString } from 'class-validator'

export class SteadfastCourierDto {
  @IsString()
  @IsOptional()
  apiKey?: string

  @IsString()
  @IsOptional()
  secretKey?: string

  /**
   * Optional shared secret used to verify the X-Steadfast-Signature header on
   * inbound webhook callbacks. When set, the webhook handler rejects any
   * request whose signature doesn't match HMAC-SHA256(secret, rawBody).
   */
  @IsString()
  @IsOptional()
  webhookSecret?: string
}
