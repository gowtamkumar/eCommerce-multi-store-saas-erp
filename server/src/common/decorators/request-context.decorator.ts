import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RequestContextDto } from '../dto/request-context.dto'

export const RequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContextDto => {
    const request = ctx.switchToHttp().getRequest()
    let storeId = request.storeId || (request.headers['x-store-id'] as string) || null
    if (storeId === 'null' || storeId === 'undefined') {
      storeId = null
    }

    return {
      userId: request.user?.id || null,
      storeId,
      branchId: request.headers['x-branch-id'] || null,
      user: request.user || null,
      sessionId: request.user?.sessionId || null,
    }
  },
)
