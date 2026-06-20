import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class TestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class TestSmsDto {
  @IsString()
  @IsNotEmpty()
  phone: string
}
