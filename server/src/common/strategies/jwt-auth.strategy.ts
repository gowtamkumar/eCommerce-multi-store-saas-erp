import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AccessTokenPayload } from 'src/modules/admin/core/auth/dtos'
import { UserDto } from 'src/modules/admin/core/user/dtos/user.dto'
import { UserService } from 'src/modules/admin/core/user/services/user.service'
import { SessionEntity } from 'src/modules/admin/core/auth/entities/session.entity'
import { sanitizeUser } from 'src/common/utils/sanitize-user.util'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

/**
 * JWT validation strategy — hot path for every authenticated request.
 *
 * Performance optimisations applied:
 *
 * 1. Session validation (was: 1 DB query per request)
 *    The session record is cached in Redis for its remaining TTL under the key
 *    `auth:session:<sessionId>`. On a cache hit the DB query is skipped entirely.
 *    The cache entry is written on the first miss and invalidated by AuthService
 *    whenever the session is deactivated (logout / revoke / token rotation).
 *
 * 2. User profile lookup (was: 1 uncached DB query per request)
 *    Switched from userService.getUser() (always hits DB) to
 *    userService.findUserById() which caches the user profile under
 *    `user:profile:<userId>` for 1 hour and serves subsequent requests from cache.
 *
 * Combined effect: 0 DB queries per request on a warm cache (Redis only).
 */
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtAuthStrategy.name)

  // Matches the TTL used when writing session cache entries (seconds)
  private readonly SESSION_CACHE_TTL_SECONDS = 300 // 5 minutes — refresh on each hit

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      ignoreExpiration: false,
    })
  }

  async validate(
    payload: AccessTokenPayload & { sessionId?: string },
  ): Promise<UserDto & { sessionId?: string }> {
    const { sub: userId, sessionId } = payload
    try {
      if (!sessionId) {
        throw new UnauthorizedException('Token is missing session identifier')
      }

      // ── Step 1: Validate session — Redis first, DB on miss ────────────
      const session = await this.resolveSession(sessionId)

      if (!session || !session.isActive || new Date() > new Date(session.expiresAt)) {
        this.logger.error(`[JwtStrategy] Session not found, inactive, or expired: ${sessionId}`)
        // If the cached entry now shows the session is expired/inactive, evict it
        await this.cacheService.delCache(`auth:session:${sessionId}`)
        throw new UnauthorizedException('Session is invalid or has expired')
      }

      // ── Step 2: Load user — Redis first, DB on miss ───────────────────
      const user = await this.userService.findUserById(userId)
      if (!user) {
        this.logger.error(`[JwtStrategy] User not found for ID: ${userId}`)
        throw new UnauthorizedException('Token not valid - User not found')
      }

      return { ...sanitizeUser(user), sessionId } as any
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error
      this.logger.error(`[JwtStrategy] Error validating user:`, error)
      throw new UnauthorizedException('Token not valid - Validation error')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve a session record — from Redis cache first, fallback to DB.
   *
   * On a DB hit the record is cached for SESSION_CACHE_TTL_SECONDS so that
   * subsequent requests for the same session skip the DB entirely.
   */
  private async resolveSession(sessionId: string): Promise<SessionEntity | null> {
    const cacheKey = `auth:session:${sessionId}`

    const cached = await this.cacheService.getCache<SessionEntity>(cacheKey)
    if (cached) {
      this.logger.debug(`[Cache HIT] Session ${sessionId}`)
      return cached
    }

    this.logger.debug(`[Cache MISS] Fetching session ${sessionId} from DB`)
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, isActive: true },
    })

    if (session) {
      // Calculate remaining TTL — don't cache beyond the session's own expiry
      const remainingSeconds = Math.floor(
        (new Date(session.expiresAt).getTime() - Date.now()) / 1000,
      )
      const ttl = Math.min(this.SESSION_CACHE_TTL_SECONDS, Math.max(remainingSeconds, 0))
      if (ttl > 0) {
        await this.cacheService.setCache(cacheKey, session, ttl)
      }
    }

    return session
  }
}
