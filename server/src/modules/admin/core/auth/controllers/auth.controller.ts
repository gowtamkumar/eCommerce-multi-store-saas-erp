import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common'
// import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Audit } from '@/common/decorators/audit.decorator'
import { RegisterCredentialDto } from '@/modules/admin/core/auth/dtos'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('/register')
  @Audit({ entity: 'Auth', action: 'REGISTER' })
  async register(
    @RequestContext() ctx: RequestContextDto,
    @Body() registerCredentialDto: RegisterCredentialDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called register.`)
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent'] || ''
    const ipStr = typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : ''

    const authPayload = await this.authService.register(
      registerCredentialDto,
      ctx.storeId,
      ipStr,
      userAgent,
    )
    // set cookies token
    this.cookiesBuildTokenResponsive(res, authPayload.accessToken)

    return {
      success: true,
      statusCode: 201,
      message: `Registration successful`,
      data: authPayload,
    }
  }

  // @SkipThrottle({ sensitive: true, transactional: true, promo: true })
  // @Throttle({ standard: { limit: 60, ttl: 60000 } })
  @Post('/refresh')
  @PublicDuringExpiration()
  async refresh(
    @Body() body: { userId: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<BaseApiSuccessResponse<any>> {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent'] || ''
    const ipStr = typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : ''

    const tokens = await this.authService.refreshTokens(
      body.userId,
      body.refreshToken,
      ipStr,
      userAgent,
    )
    this.cookiesBuildTokenResponsive(res, tokens.accessToken)

    return {
      success: true,
      statusCode: 200,
      message: `Token refreshed successfully`,
      data: tokens,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @Audit({ entity: 'Auth', action: 'LOGOUT' })
  async logout(
    @RequestContext() ctx: RequestContextDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called logout.`)
    await this.authService.logout(ctx.userId, ctx.sessionId)
    res.clearCookie('token')
    return {
      success: true,
      statusCode: 200,
      message: `Logout successful`,
      data: null,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/sessions')
  async getSessions(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const sessions = await this.authService.getUserSessions(ctx.userId)
    return {
      success: true,
      statusCode: 200,
      message: 'Active sessions retrieved successfully',
      data: sessions,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/sessions/other')
  @Audit({ entity: 'Session', action: 'REVOKE_OTHERS' })
  async revokeOtherSessions(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.authService.revokeAllOtherSessions(ctx.userId, ctx.sessionId)
    return {
      success: true,
      statusCode: 200,
      message: 'Other sessions revoked successfully',
      data: null,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/sessions/:id')
  @Audit({ entity: 'Session', action: 'REVOKE' })
  async revokeSession(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') sessionId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.authService.revokeSession(sessionId, ctx.userId)
    return {
      success: true,
      statusCode: 200,
      message: 'Session revoked successfully',
      data: null,
    }
  }

  @Post('/verify')
  async verify(@Body() body: { token: string }): Promise<BaseApiSuccessResponse<null>> {
    const { token } = body
    await this.authService.verifyEmail(token)
    return {
      success: true,
      statusCode: 200,
      message: `Email verified successfully`,
      data: null,
    }
  }

  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('/forgot-password')
  async forgotPassword(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { email: string },
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called forgotPassword.`)
    const { email } = body
    await this.authService.forgotPassword(email, ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: `If an account is associated with this email, you will receive a reset link shortly.`,
      data: null,
    }
  }

  @Post('/reset-password')
  @Audit({ entity: 'Auth', action: 'PASSWORD_RESET' })
  async resetPassword(
    @Body() body: { token: string; password: string },
  ): Promise<BaseApiSuccessResponse<null>> {
    const { token, password } = body
    await this.authService.resetPassword(token, password)
    return {
      success: true,
      statusCode: 200,
      message: `Password reset successful. You can now login.`,
      data: null,
    }
  }

  @Post('/accept-invitation')
  @Audit({ entity: 'Auth', action: 'ACCEPT_INVITATION' })
  async acceptInvitation(@Body() body: any): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`acceptInvitation called.`)
    const data = await this.authService.acceptInvitation(body)
    return {
      success: true,
      statusCode: 201,
      message: data.message,
      data: data.user,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @PublicDuringExpiration()
  async getMe(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getMe.`)
    const result = await this.authService.getMe(ctx.user)
    return {
      success: true,
      statusCode: 200,
      message: 'Current user profile',
      data: result,
    }
  }

  private cookiesBuildTokenResponsive(response: Response, token: string) {
    const cookiesOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    }
    return response.cookie('token', token, cookiesOptions)
  }
}
