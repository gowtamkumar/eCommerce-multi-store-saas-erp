import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsNotEmpty()
  mimetype: string

  @IsNumber()
  @IsOptional()
  size?: number
}
