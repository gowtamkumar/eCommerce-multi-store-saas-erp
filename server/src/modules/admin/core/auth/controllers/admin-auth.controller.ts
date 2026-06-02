import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { LoginCredentialDto } from '@/modules/admin/core/auth/dtos'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import {
  Body,
  Controller,
  Delete,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Controller('admin')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name)

  constructor(private readonly authService: AuthService) {}

  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('/login')
  async login(
    @RequestContext() ctx: RequestContextDto,
    @Body() loginCredentialDto: LoginCredentialDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called login.`)
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      const userAgent = req.headers['user-agent'] || ''
      const ipStr = typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : ''

      const authPayload = await this.authService.login(
        loginCredentialDto,
        ctx.tenantId,
        ipStr,
        userAgent,
      )
      // set cookies token
      this.cookiesBuildTokenResponsive(res, authPayload.accessToken)

      return {
        success: true,
        statusCode: 200,
        message: `Admin Login successful`,
        data: authPayload,
      }
    } catch (error) {
      console.error('Admin Login Error:', error)
      throw error
    }
  }

  @Post('/login-impersonated')
  async loginImpersonated(
    @RequestContext() ctx: RequestContextDto,
    @Body('impersonateToken') impersonateToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`loginImpersonated called.`)
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
      const userAgent = req.headers['user-agent'] || ''
      const ipStr = typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : ''

      // 1. Verify impersonateToken using AuthService
      const decoded = await this.authService.verifyImpersonateToken(impersonateToken)
      if (!decoded || decoded.purpose !== 'impersonation') {
        throw new UnauthorizedException('Invalid impersonation token')
      }

      // 2. Fetch the target user details
      const user = await this.authService.getUserForImpersonation(decoded.userId)
      if (!user) {
        throw new UnauthorizedException('Impersonated user not found')
      }

      // 3. Resolve features
      let features: string[] = []
      if (user.role === UserRole.SUPER_ADMIN) {
        features = ['*']
      } else if (user.tenantId) {
        const tenant = await this.authService
          .getUserForImpersonation(user.id)
          .then((u) => u?.tenant)
        features = tenant?.subscriptionPlan?.features || []
      }

      // 4. Generate user tokens
      const tokens = await this.authService.getTokens(user, features, ipStr, userAgent)

      this.cookiesBuildTokenResponsive(res, tokens.accessToken)

      return {
        success: true,
        statusCode: 200,
        message: `Admin Impersonation successful`,
        data: {
          user: { ...user, features },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      }
    } catch (error) {
      console.error('Impersonation Login Error:', error)
      throw new UnauthorizedException('Impersonation session could not be established')
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`Admin logout called.`)
    //revoke token from database
    if (req.user) {
      await this.authService.logout((req.user as any).id, (req.user as any).sessionId)
    }

    // clear cookies
    Object.entries(req.cookies).forEach(([key]) => res.clearCookie(key))

    return {
      success: true,
      statusCode: 200,
      message: `Logout successful`,
      data: null,
    }
  }

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

  private cookiesBuildTokenResponsive(response: Response, token: string) {
    const cookiesOptions = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    }
    return response.status(200).cookie('token', token, cookiesOptions)
  }
}
