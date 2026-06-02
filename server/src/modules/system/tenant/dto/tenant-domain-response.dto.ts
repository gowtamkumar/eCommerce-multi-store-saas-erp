import { Expose } from 'class-transformer'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'

export class TenantDomainResponseDto {
  @Expose()
  id: string

  @Expose()
  hostname: string

  @Expose()
  isPrimary: boolean

  @Expose()
  status: CustomDomainStatus

  @Expose()
  verificationToken: string | null

  @Expose()
  verifiedAt: Date | null
}
