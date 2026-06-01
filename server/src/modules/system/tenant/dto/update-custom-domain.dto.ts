import { IsString, Length } from 'class-validator'

export class UpdateCustomDomainDto {
  @IsString()
  @Length(4, 253)
  customDomain: string
}
