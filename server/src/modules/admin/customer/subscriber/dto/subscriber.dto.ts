import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateSubscriberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class UpdateSubscriberDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
