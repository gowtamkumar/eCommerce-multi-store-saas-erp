import { IsNotEmpty, Length } from 'class-validator'

export class UpdatePasswordDto {
  @IsNotEmpty()
  currentPassword: string

  @IsNotEmpty()
  @Length(8, 20)
  newPassword: string
}
