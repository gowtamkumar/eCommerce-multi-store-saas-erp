import { Body, Controller, Get, Post, Res, UseGuards, Logger } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
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

  @Post('/register')
  async register(
    @RequestContext() ctx: RequestContextDto,
    @Body() registerCredentialDto: RegisterCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called register.`)
    const authPayload = await this.authService.register(registerCredentialDto, ctx.tenantId)
    // set cookies token
    this.cookiesBuildTokenResponsive(res, authPayload.accessToken)

    return {
      success: true,
      statusCode: 201,
      message: `Registration successful`,
      data: authPayload,
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

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(
    @RequestContext() ctx: RequestContextDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called logout.`)
    await this.authService.logout(ctx.userId)
    res.clearCookie('token')
    return {
      success: true,
      statusCode: 200,
      message: `Logout successful`,
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

  @Post('/forgot-password')
  async forgotPassword(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { email: string },
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called forgotPassword.`)
    const { email } = body
    await this.authService.forgotPassword(email, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `If an account is associated with this email, you will receive a reset link shortly.`,
      data: null,
    }
  }

  @Post('/reset-password')
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
  async getMe(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
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
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    }
    return response.status(200).cookie('token', token, cookiesOptions)
  }
}
