import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FaqStatus } from '../../../common/enums/faq-status.enum';

export class CreateFaqDto {
    @ApiProperty()
    @IsString()
    question: string;

    @ApiProperty()
    @IsString()
    answer: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({ enum: FaqStatus, required: false })
    @IsEnum(FaqStatus)
    @IsOptional()
    status?: FaqStatus;
}

export class UpdateFaqDto extends CreateFaqDto { }
