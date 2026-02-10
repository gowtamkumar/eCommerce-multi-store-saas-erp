import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class TrustBadgeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
