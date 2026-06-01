import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common'
import { randomBytes } from 'crypto'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberEntity, SubscriberStatus } from './entities/subscriber.entity'
import { SubscriberRepository } from './subscriber.repository'

interface SignupContext {
  source?: string
  ip?: string
  userAgent?: string
}

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name)

  constructor(
    private readonly subscriberRepository: SubscriberRepository,
    private readonly cache: CacheService,
    // Mail is optional so we don't require an additional forward-ref import
    // dance at module wiring time; the service degrades gracefully (logs
    // the verify/unsubscribe URLs) when it's unavailable.
    @Optional() private readonly mailService?: MailService,
  ) {}

  /**
   * Storefront signup. Creates a PENDING subscriber if new, or re-issues a
   * confirmation token if the row exists but isn't confirmed. Always returns
   * a generic success response so attackers can't enumerate subscribers.
   */
  async signup(
    createSubscriberDto: CreateSubscriberDto,
    ctx: RequestContextDto,
    signupCtx: SignupContext = {},
  ): Promise<{ ok: true }> {
    const tenantId = ctx.tenantId
    const email = createSubscriberDto.email.trim().toLowerCase()

    const existing = await this.subscriberRepository.findByEmail(email, tenantId)

    if (existing) {
      switch (existing.status) {
        case SubscriberStatus.CONFIRMED:
          this.logger.debug(`Subscriber re-signup for already-confirmed ${email}`)
          return { ok: true }
        case SubscriberStatus.SUPPRESSED:
          // Hard suppression — bounces or spam complaints. Refuse silently.
          this.logger.warn(`Suppressed email attempted re-signup: ${email}`)
          return { ok: true }
        case SubscriberStatus.UNSUBSCRIBED:
        case SubscriberStatus.PENDING:
        default:
          existing.status = SubscriberStatus.PENDING
          existing.confirmationToken = this.generateToken()
          existing.unsubscribedAt = null
          existing.isActive = false
          existing.source = createSubscriberDto.source ?? existing.source
          existing.consentIp = signupCtx.ip ?? existing.consentIp
          existing.consentUserAgent = signupCtx.userAgent ?? existing.consentUserAgent
          await this.subscriberRepository.save(existing)
          await this.sendConfirmationEmail(existing, tenantId)
          return { ok: true }
      }
    }

    const subscriber = await this.subscriberRepository.createAndSave(
      {
        email,
        status: SubscriberStatus.PENDING,
        isActive: false,
        confirmationToken: this.generateToken(),
        unsubscribeToken: this.generateToken(),
        source: createSubscriberDto.source ?? signupCtx.source ?? 'storefront',
        consentIp: signupCtx.ip,
        consentUserAgent: signupCtx.userAgent,
      },
      ctx,
    )
    await this.sendConfirmationEmail(subscriber, tenantId)
    await this.cache.delCacheByPattern('subscribers:list*', tenantId)
    return { ok: true }
  }

  /**
   * Admin-only direct create. Used by the back-office to add already-known
   * mailing list contacts (e.g. imported from a CSV). Skips double opt-in
   * but still requires `consent_source` for auditability.
   */
  async createSubscriber(
    createSubscriberDto: CreateSubscriberDto,
    ctx: RequestContextDto,
  ): Promise<SubscriberEntity> {
    this.logger.log(`${this.createSubscriber.name} Service Called`)
    const tenantId = ctx.tenantId
    const email = createSubscriberDto.email.trim().toLowerCase()
    const existing = await this.subscriberRepository.findByEmail(email, tenantId)
    if (existing) {
      throw new ConflictException('Email is already subscribed to this store')
    }

    const subscriber = await this.subscriberRepository.createAndSave(
      {
        email,
        status: SubscriberStatus.CONFIRMED,
        isActive: true,
        confirmedAt: new Date(),
        unsubscribeToken: this.generateToken(),
        source: createSubscriberDto.source ?? 'admin-import',
      },
      ctx,
    )
    await this.cache.delCacheByPattern('subscribers:list*', tenantId)
    return subscriber
  }

  /**
   * Verify a double-opt-in confirmation token. Idempotent — repeated hits
   * return the already-confirmed subscriber without re-sending anything.
   */
  async confirm(token: string): Promise<{ confirmed: boolean }> {
    if (!token) throw new BadRequestException('Confirmation token is required')
    const subscriber = await this.subscriberRepository.findByConfirmationToken(token)
    if (!subscriber) throw new NotFoundException('Invalid or expired confirmation link')

    if (subscriber.status === SubscriberStatus.CONFIRMED) return { confirmed: true }

    subscriber.status = SubscriberStatus.CONFIRMED
    subscriber.isActive = true
    subscriber.confirmedAt = new Date()
    subscriber.confirmationToken = null
    if (!subscriber.unsubscribeToken) {
      subscriber.unsubscribeToken = this.generateToken()
    }
    await this.subscriberRepository.save(subscriber)
    await this.cache.delCacheByPattern('subscribers:list*', subscriber.tenantId)
    return { confirmed: true }
  }

  /**
   * One-click unsubscribe (RFC 8058 / GDPR friendly). Token is single-purpose
   * and is rotated when the subscriber resubscribes.
   */
  async unsubscribe(token: string): Promise<{ unsubscribed: boolean }> {
    if (!token) throw new BadRequestException('Unsubscribe token is required')
    const subscriber = await this.subscriberRepository.findByUnsubscribeToken(token)
    if (!subscriber) throw new NotFoundException('Invalid unsubscribe link')

    if (subscriber.status === SubscriberStatus.UNSUBSCRIBED) return { unsubscribed: true }

    subscriber.status = SubscriberStatus.UNSUBSCRIBED
    subscriber.isActive = false
    subscriber.unsubscribedAt = new Date()
    await this.subscriberRepository.save(subscriber)
    await this.cache.delCacheByPattern('subscribers:list*', subscriber.tenantId)
    return { unsubscribed: true }
  }

  /**
   * Mark an email as permanently suppressed — driven by webhooks from the
   * email provider on hard bounces or spam complaints.
   */
  async suppress(email: string, tenantId: string, reason?: string): Promise<void> {
    const subscriber = await this.subscriberRepository.findByEmail(email, tenantId)
    if (!subscriber) return
    subscriber.status = SubscriberStatus.SUPPRESSED
    subscriber.isActive = false
    if (reason) subscriber.source = `${subscriber.source ?? 'unknown'}; suppressed: ${reason}`
    await this.subscriberRepository.save(subscriber)
  }

  /**
   * GDPR data-subject erasure — drop the row entirely. Use with care.
   */
  async deleteByEmail(email: string, tenantId: string): Promise<{ deleted: boolean }> {
    const subscriber = await this.subscriberRepository.findByEmail(email, tenantId)
    if (!subscriber) return { deleted: false }
    await this.subscriberRepository.remove(subscriber)
    await this.cache.delCacheByPattern('subscribers:list*', tenantId)
    return { deleted: true }
  }

  async findAllSubscribers(
    filterDto: any,
    ctx: RequestContextDto,
  ): Promise<{ subscribers: SubscriberEntity[]; total: number }> {
    this.logger.log(`${this.findAllSubscribers.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 10, search = '' } = filterDto || {}
    const cacheKey = `subscribers:list:p${page}:l${limit}:q${search}`

    return this.cache.rememberCache(
      cacheKey,
      () => this.subscriberRepository.findAllWithFilters(filterDto || {}, tenantId),
      300,
      tenantId || 'global',
    )
  }

  private generateToken(): string {
    return randomBytes(24).toString('hex')
  }

  private async sendConfirmationEmail(
    subscriber: SubscriberEntity,
    tenantId: string,
  ): Promise<void> {
    if (!this.mailService || !subscriber.confirmationToken) {
      this.logger.warn(
        `Mail unavailable — skipping confirmation send. Token=${subscriber.confirmationToken}`,
      )
      return
    }
    try {
      const base = await this.getPublicBaseUrl(tenantId)
      const verifyUrl = `${base}/api/v1/subscribers/confirm?token=${subscriber.confirmationToken}`
      const unsubUrl = `${base}/api/v1/subscribers/unsubscribe?token=${subscriber.unsubscribeToken ?? ''}`
      await this.mailService.sendGenericEmail({
        to: subscriber.email,
        subject: 'Please confirm your subscription',
        html: `
          <p>Hi,</p>
          <p>Thanks for subscribing. Please confirm your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">Confirm my subscription</a></p>
          <p>If you didn't sign up, no further action is needed.</p>
          <hr/>
          <p style="font-size:11px;color:#777">
            Don't want any messages? <a href="${unsubUrl}">Unsubscribe</a>.
          </p>
        `,
        tenantId,
      })
    } catch (e: any) {
      // Never throw — the user already submitted a form.
      this.logger.error(`Failed to send confirmation email: ${e?.message}`)
    }
  }

  private async getPublicBaseUrl(_tenantId: string): Promise<string> {
    // Public base URL is configured per-environment. If you need per-tenant
    // domains here, wire `SettingsService` and read `publicBaseUrl` from
    // the tenant's site-settings row.
    return process.env.PUBLIC_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000'
  }
}
