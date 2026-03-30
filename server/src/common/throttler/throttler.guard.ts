import { ExecutionContext, Injectable } from '@nestjs/common'
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const tenantId = req.tenantId || 'global'
    const userId = req.user?.id || 'anonymous'
    const ip = req.ip

    // For sensitive endpoints (Login/OTP), we primarily care about IP + Tenant
    // For authenticated endpoints, we care about User + Tenant
    // This tracker string will be used as the key in Redis
    return `${tenantId}:${userId}:${ip}`
  }

  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.')
  }
}
