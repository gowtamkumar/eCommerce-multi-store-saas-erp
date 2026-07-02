import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

// Extend Express Request to include storeId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      storeId?: string
    }
  }
}

@Injectable()
export class StoreContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl || ''
    const cleanPath = originalUrl.split('?')[0]
    // Skip store validation for root path, swagger docs, or any route outside the api/v1 prefix
    if (cleanPath === '/' || cleanPath === '' || !cleanPath.startsWith('/api/v1')) {
      return next()
    }

    // Extract storeId from header
    const storeId = req.headers['x-store-id'] as string
    if (!storeId || storeId === 'null' || storeId === 'undefined') {
      throw new BadRequestException('Store context missing')
    }

    // Attach storeId to request
    req.storeId = storeId

    next()
  }
}
