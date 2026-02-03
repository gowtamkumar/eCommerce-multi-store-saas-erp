import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadStatus } from '../../../common/enums/lead-status.enum';

export class CreateLeadDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    subject?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    message?: string;
}

export class UpdateLeadDto {
    @ApiProperty({ enum: LeadStatus })
    @IsEnum(LeadStatus)
    status: LeadStatus;
}
