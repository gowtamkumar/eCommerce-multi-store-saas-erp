import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RequestContextDto } from '../dto/request-context.dto'

export const RequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContextDto => {
    const request = ctx.switchToHttp().getRequest()
    return {
      userId: request.user?.id || null,
      tenantId: request.tenantId || request.headers['x-tenant-id'] || null,
      branchId: request.headers['x-branch-id'] || null,
      user: request.user || null,
    }
  },
)
