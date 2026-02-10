import {
  IsOptional,
  IsString
} from 'class-validator';

export class CreateSteadfastOrderDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  // @ApiProperty({
  //   description: 'Unique invoice number (alpha-numeric, hyphens, underscores)',
  //   example: 'INV-12345',
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Matches(/^[a-zA-Z0-9_-]+$/, {
  //   message: 'Invoice must contain only letters, numbers, hyphens, and underscores',
  // })
  // invoice: string;

  // @ApiProperty({
  //   description: 'Recipient name (max 100 characters)',
  //   example: 'John Smith',
  // })
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(100)
  // recipient_name: string;

  // @ApiProperty({
  //   description: 'Recipient phone number (11 digits)',
  //   example: '01234567890',
  // })
  // @IsNotEmpty()
  // @IsString()
  // @Length(11, 11)
  // @Matches(/^0\d{10}$/, {
  //   message: 'Recipient phone must be 11 digits starting with 0',
  // })
  // recipient_phone: string;

  // @ApiProperty({
  //   description: 'Alternative phone number (11 digits)',
  //   example: '01987654321',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // @Length(11, 11)
  // @Matches(/^0\d{10}$/, {
  //   message: 'Alternative phone must be 11 digits starting with 0',
  // })
  // alternative_phone?: string;

  // @ApiProperty({
  //   description: 'Recipient email address',
  //   example: 'customer@example.com',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // recipient_email?: string;

  // @ApiProperty({
  //   description: 'Recipient address (max 250 characters)',
  //   example: 'Flat# A1, House# 17/1, Road# 3/A, Dhanmondi, Dhaka-1209',
  // })
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(250)
  // recipient_address: string;

  // @ApiProperty({
  //   description: 'Cash on delivery amount in BDT',
  //   example: 1060,
  // })
  // @IsNotEmpty()
  // @IsNumber()
  // @Min(0)
  // cod_amount: number;

  // @ApiProperty({
  //   description: 'Delivery instructions or notes',
  //   example: 'Deliver within 3 PM',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // note?: string;

  // @ApiProperty({
  //   description: 'Items name and description',
  //   example: '1x T-Shirt (Blue, XL)',
  //   required: false,
  // })
  // @IsOptional()
  // @IsString()
  // item_description?: string;

  // @ApiProperty({
  //   description: 'Total lot of items',
  //   example: 1,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // total_lot?: number;

  // @ApiProperty({
  //   description: 'Delivery type: 0 = home delivery, 1 = point delivery/hub pickup',
  //   example: 0,
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // @IsIn([0, 1])
  // delivery_type?: number;
}
