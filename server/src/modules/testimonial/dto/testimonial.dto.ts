import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestimonialDto {
    @ApiProperty()
    @IsString()
    author: string;

    @ApiProperty()
    @IsString()
    role: string;

    @ApiProperty()
    @IsString()
    content: string;

    @ApiProperty()
    @IsNumber()
    rating: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    status?: string;
}

export class UpdateTestimonialDto extends CreateTestimonialDto { }
