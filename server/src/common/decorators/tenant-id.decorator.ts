import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest()
    const tenantId = request.tenantId || request.headers['x-tenant-id']
    return tenantId === 'null' || tenantId === 'undefined' ? null : tenantId
  },
)
