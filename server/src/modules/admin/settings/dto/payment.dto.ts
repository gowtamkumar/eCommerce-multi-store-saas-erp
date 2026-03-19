import { IsBoolean, IsOptional, IsString } from "class-validator";

export class PaymentDto {
        @IsString()
        @IsOptional()
        stripePublishableKey?: string;
        @IsString()
        @IsOptional()
        stripeSecretKey?: string;
        @IsString()
        @IsOptional()
        sslCommerzStoreId?: string;
        @IsString()
        @IsOptional()
        sslCommerzStorePassword?: string;
        @IsBoolean()
        @IsOptional()
        sslCommerzIsSandbox?: boolean;
    
}