import { BadRequestException } from '@nestjs/common'

export function assertTenantContext(tenantId: string | null | undefined): string {
  if (!tenantId || tenantId === 'null' || tenantId === 'undefined') {
    throw new BadRequestException(
      'Tenant context missing. Open this store from its domain or send a valid x-tenant-id header.',
    )
  }

  return tenantId
}
