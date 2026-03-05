import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordSupplierPaymentDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsDateString()
    @IsOptional()
    paymentDate?: string;

    @IsString()
    paymentMethod: string;

    @IsString()
    @IsOptional()
    transactionId?: string;

    @IsString()
    @IsOptional()
    note?: string;
}
