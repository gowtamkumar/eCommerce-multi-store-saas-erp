import {
    IsArray,
    IsBoolean,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Min,
} from 'class-validator'

export class CreateSubscriptionPlanDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsNumber()
    @Min(0)
    price: number

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[]

    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}
