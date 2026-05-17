import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreatePosRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsUUID()
  @IsNotEmpty()
  branchId: string
}
