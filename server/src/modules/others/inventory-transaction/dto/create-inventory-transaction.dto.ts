import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { InventoryTransactionType } from '../../../../common/enums/inventory-transaction-type.enum';
import { InventoryTransactionReferenceType } from '../../../../common/enums/inventory-transaction-reference-type.enum';

export class CreateInventoryTransactionDto {
    @IsUUID()
    productId: string;

    @IsEnum(InventoryTransactionType)
    type: InventoryTransactionType;

    @IsNumber()
    quantity: number;

    @IsEnum(InventoryTransactionReferenceType)
    referenceType: InventoryTransactionReferenceType;

    @IsString()
    @IsOptional()
    referenceId?: string;
}
