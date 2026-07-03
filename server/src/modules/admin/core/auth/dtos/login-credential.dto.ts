import { IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class LoginCredentialDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  usernameOrEmail: string

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  password: string
}
