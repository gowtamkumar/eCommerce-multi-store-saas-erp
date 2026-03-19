import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { InvoiceStatus } from 'src/common/enums/invoice-status.enum';

export class CreateInvoiceDto {
    @IsUUID()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    invoiceNumber: string;

    @IsDateString()
    @IsNotEmpty()
    issueDate: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;
}
