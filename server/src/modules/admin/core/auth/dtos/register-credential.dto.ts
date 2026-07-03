import { Transform } from 'class-transformer'
import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength, Matches } from 'class-validator'

export class RegisterCredentialDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @IsDefined()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  username: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  @IsDefined()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value || null))
  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  storeId: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  emailVerificationToken?: string

  @IsString()
  @IsOptional()
  referralCode?: string
}
