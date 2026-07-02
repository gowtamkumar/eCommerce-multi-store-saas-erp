import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const StoreId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest()
    const storeId = request.storeId || request.headers['x-store-id']
    return storeId === 'null' || storeId === 'undefined' ? null : storeId
  },
)
