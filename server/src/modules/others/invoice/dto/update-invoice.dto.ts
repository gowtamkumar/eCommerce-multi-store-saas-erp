import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus } from 'src/common/enums/invoice-status.enum';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;
}
