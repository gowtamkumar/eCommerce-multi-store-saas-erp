import { IsBoolean, IsOptional, IsString } from "class-validator";

export class PathaoCourierDto {
   @IsString()
   @IsOptional()
  pathaoClientId?: string;

   @IsString()
   @IsOptional()
  pathaoClientSecret?: string;

   @IsString()
   @IsOptional()
  pathaoUsername?: string;

   @IsString()
   @IsOptional()
  pathaoPassword?: string;

   @IsBoolean()
   @IsOptional()
    sandboxMode?: boolean;
}