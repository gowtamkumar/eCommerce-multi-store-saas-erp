import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { SupplierInvoiceStatus } from '../entities/supplier-invoice.entity'

export class CreateSupplierInvoiceItemDto {
  @IsUUID()
  productId: string

  @IsNumber()
  quantity: number

  @IsNumber()
  unitPrice: number
}

export class CreateSupplierInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string

  @IsUUID()
  supplierId: string

  @IsUUID()
  purchaseOrderId: string

  @IsString()
  @IsNotEmpty()
  invoiceDate: string

  @IsString()
  @IsNotEmpty()
  dueDate: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierInvoiceItemDto)
  items: CreateSupplierInvoiceItemDto[]
}

export class UpdateSupplierInvoiceStatusDto {
  @IsEnum(SupplierInvoiceStatus)
  status: SupplierInvoiceStatus

  @IsString()
  @IsOptional()
  discrepancyNotes?: string
}
