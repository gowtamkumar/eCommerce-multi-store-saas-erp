import { SetMetadata } from '@nestjs/common'

/** Routes that are authenticated but intentionally skip RBAC permission checks (self-service, sessions). */
export const SKIP_PERMISSION_CHECK_KEY = 'skipPermissionCheck'
export const SkipPermissionCheck = () => SetMetadata(SKIP_PERMISSION_CHECK_KEY, true)
