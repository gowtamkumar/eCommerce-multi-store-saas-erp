import { SetMetadata } from '@nestjs/common'

export const AUDIT_METADATA_KEY = 'audit_metadata'

export interface AuditOptions {
  entity: string
  action?: string
}

/**
 * Decorator to mark a controller or method for audit logging.
 * Usage: @Audit({ entity: 'Product', action: 'CREATE' })
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA_KEY, options)
