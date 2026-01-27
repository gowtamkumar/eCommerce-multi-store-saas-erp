import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

// Extend Express Request to include tenantId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantId?: string
    }
  }
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenantId from header
    const tenantId = req.headers['x-tenant-id'] as string
    if (!tenantId) {
      throw new BadRequestException('Tenant context missing')
    }

    // Attach tenantId to request
    req.tenantId = tenantId

    next()
  }
}
