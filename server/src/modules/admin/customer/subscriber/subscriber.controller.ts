import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { SubscriberResponseDto } from './dto/subscriber-response.dto'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberService } from './subscriber.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@UseGuards(SubscriptionGuard)
@RequireFeature('marketing')
@Controller('subscribers')
export class SubscriberController {
  private readonly logger = new Logger(SubscriberController.name)

  constructor(private readonly subscriberService: SubscriberService) {}

  /**
   * Storefront signup — public endpoint. Always returns a generic 201
   * response so attackers can't enumerate subscribed emails. A double
   * opt-in confirmation email is sent on the way out.
   */
  @Public()
  @Post()
  async signupSubscriber(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @RequestContext() ctx: RequestContextDto,
    @Req() req: Request,
    @Headers('user-agent') ua: string,
  ): Promise<BaseApiSuccessResponse<{ ok: true }>> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req as any).ip ||
      (req.socket && (req.socket as any).remoteAddress) ||
      undefined
    await this.subscriberService.signup(createSubscriberDto, ctx, { ip, userAgent: ua })
    return {
      success: true,
      statusCode: 201,
      message: 'Please check your email to confirm your subscription',
      data: { ok: true },
    }
  }

  /**
   * Admin-only forced create (no double opt-in, requires consent source).
   */
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async createSubscriber(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto>> {
    const result = await this.subscriberService.createSubscriber(createSubscriberDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Subscribed successfully',
      data: result as any,
    }
  }

  @Public()
  @Get('confirm')
  async confirm(@Query('token') token: string, @Res() res: Response): Promise<void> {
    try {
      await this.subscriberService.confirm(token)
      res
        .type('text/html')
        .send(
          `<html><body style="font-family:sans-serif;max-width:480px;margin:48px auto;text-align:center;"><h2>You're confirmed!</h2><p>Thanks for subscribing. You're all set to receive updates.</p></body></html>`,
        )
    } catch (e: any) {
      res
        .status(400)
        .type('text/html')
        .send(
          `<html><body style="font-family:sans-serif;max-width:480px;margin:48px auto;text-align:center;"><h2>Confirmation failed</h2><p>${
            e?.message ?? 'This link may have expired.'
          }</p></body></html>`,
        )
    }
  }

  @Public()
  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string, @Res() res: Response): Promise<void> {
    try {
      await this.subscriberService.unsubscribe(token)
      res
        .type('text/html')
        .send(
          `<html><body style="font-family:sans-serif;max-width:480px;margin:48px auto;text-align:center;"><h2>You've been unsubscribed</h2><p>We're sorry to see you go. You won't receive future emails from this list.</p></body></html>`,
        )
    } catch (e: any) {
      res
        .status(400)
        .type('text/html')
        .send(
          `<html><body style="font-family:sans-serif;max-width:480px;margin:48px auto;text-align:center;"><h2>Could not unsubscribe</h2><p>${
            e?.message ?? 'This link may have expired.'
          }</p></body></html>`,
        )
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async findAllSubscribers(
    @Query() filterDto: any,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SubscriberResponseDto[]>> {
    const { subscribers, total } = await this.subscriberService.findAllSubscribers(filterDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'List of subscribers retrieved',
      data: subscribers as any,
      pagination: {
        total,
        page: Number(filterDto.page) || 1,
        limit: Number(filterDto.limit) || 10,
        totalPages: Math.ceil(total / (Number(filterDto.limit) || 10)),
      },
    }
  }

  /**
   * GDPR erasure — admin-only. Drops the subscriber row entirely.
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async deleteSubscriber(
    @Query('email') email: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<{ deleted: boolean }>> {
    const result = await this.subscriberService.deleteByEmail(email, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: result.deleted ? 'Subscriber deleted' : 'Subscriber not found',
      data: result,
    }
  }
}
