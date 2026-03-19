import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewStatus } from '../../../../common/enums/review-status.enum';

export class CreateReviewDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty()
    @IsString()
    customerName: string;

    @ApiProperty()
    @IsString()
    customerEmail: string;

    @ApiProperty()
    @IsNumber()
    rating: number;

    @ApiProperty()
    @IsString()
    comment: string;
}

export class UpdateReviewDto {
    @ApiProperty({ enum: ReviewStatus })
    @IsEnum(ReviewStatus)
    @IsOptional()
    status?: ReviewStatus;
}
