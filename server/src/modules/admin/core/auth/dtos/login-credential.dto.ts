import { Transform } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class LoginCredentialDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Username or email is too long' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  usernameOrEmail: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(128, { message: 'Password is too long' })
  password: string
}
