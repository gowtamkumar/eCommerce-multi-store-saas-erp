import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { LoginCredentialDto } from '@/modules/admin/core/auth/dtos'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import { Body, Controller, Delete, Logger, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'

@Controller('admin')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name)

  constructor(private readonly authService: AuthService) { }

  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('/login')
  async login(
    @RequestContext() ctx: RequestContextDto,
    @Body() loginCredentialDto: LoginCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called login.`)
    try {
      const authPayload = await this.authService.login(loginCredentialDto, ctx.tenantId)
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

  @UseGuards(JwtAuthGuard)
  @Delete('/logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`Admin logout called.`)
    //revoke token from database
    if (req.user) {
      await this.authService.logout((req.user as any).id)
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
  ): Promise<BaseApiSuccessResponse<any>> {
    const tokens = await this.authService.refreshTokens(body.userId, body.refreshToken)
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
