import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RequestContextDto } from '../dto/request-context.dto'

export const RequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContextDto => {
    const request = ctx.switchToHttp().getRequest()
    let tenantId = request.tenantId || (request.headers['x-tenant-id'] as string) || null
    if (tenantId === 'null' || tenantId === 'undefined') {
      tenantId = null
    }

    return {
      userId: request.user?.id || null,
      tenantId,
      branchId: request.headers['x-branch-id'] || null,
      user: request.user || null,
      sessionId: request.user?.sessionId || null,
    }
  },
)
