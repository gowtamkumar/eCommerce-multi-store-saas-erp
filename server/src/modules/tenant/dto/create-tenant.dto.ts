import { IsString, IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
    @ApiProperty({ example: 'My Awesome Store', description: 'Store name' })
    @IsString()
    @IsNotEmpty()
    storeName: string;

    @ApiProperty({ example: 'mystore', description: 'Subdomain for the store' })
    @IsString()
    @IsNotEmpty()
    subdomain: string;

    @ApiProperty({
        example: 'basic',
        enum: ['basic', 'pro', 'enterprise'],
        description: 'Subscription plan tier',
    })
    @IsEnum(['basic', 'pro', 'enterprise'])
    planTier: string;

    // Admin user details for the new tenant
    @ApiProperty({ example: 'Admin User', description: 'Admin name' })
    @IsString()
    @IsNotEmpty()
    adminName: string;

    @ApiProperty({ example: 'admin', description: 'Admin username' })
    @IsString()
    @IsNotEmpty()
    adminUsername: string;

    @ApiProperty({ example: 'admin@store.com', description: 'Admin email' })
    @IsEmail()
    @IsNotEmpty()
    adminEmail: string;

    @ApiProperty({ example: 'password123', description: 'Admin password' })
    @IsString()
    @MinLength(6)
    adminPassword: string;
}
