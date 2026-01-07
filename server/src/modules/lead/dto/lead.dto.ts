import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '../../../common/enums/lead-status.enum';

export class CreateLeadDto {
    @ApiProperty()
    @IsString()
    name: string;

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
    subject: string;

    @ApiProperty()
    @IsString()
    message: string;
}

export class UpdateLeadDto {
    @ApiProperty({ enum: LeadStatus })
    @IsEnum(LeadStatus)
    status: LeadStatus;
}
