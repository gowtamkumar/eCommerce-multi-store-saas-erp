import { Body, Controller, Get, Post, Res, UseGuards, Logger } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard'
import { UserDto } from '../../user/dtos'
import { RegisterCredentialDto } from '../dtos'
import { AuthService } from '../services/auth.service'
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @RequestContext() ctx: RequestContextDto, @Body() registerCredentialDto: RegisterCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called register.`);
      const authPayload = await this.authService.register(registerCredentialDto, ctx.tenantId)
      // set cookies token
      this.cookiesBuildTokenResponsive(res, authPayload.accessToken)

      return {
        success: true,
        statusCode: 200,
        message: `Registration successful`,
        data: authPayload,
      }
    }

  @Post('/refresh')
  async refresh(
    @Body() body: { userId: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
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
  async logout(@RequestContext() ctx: RequestContextDto, @Res({ passthrough: true }) res: Response) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called logout.`);
      await this.authService.logout(ctx.userId)
      res.clearCookie('token')
      return {
        success: true,
        statusCode: 200,
        message: `Logout successful`,
      }
    }

  @Post('/verify')
  async verify(@Body() body: { token: string }) {
    const { token } = body
    await this.authService.verifyEmail(token)
    return {
      success: true,
      statusCode: 200,
      message: `Email verified successfully`,
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@RequestContext() ctx: RequestContextDto, @Body() body: { email: string }) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called forgotPassword.`);
      const { email } = body
      await this.authService.forgotPassword(email, ctx.tenantId)
      return {
        success: true,
        statusCode: 200,
        message: `If an account is associated with this email, you will receive a reset link shortly.`,
      }
    }

  @Post('/reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    const { token, password } = body
    await this.authService.resetPassword(token, password)
    return {
      success: true,
      statusCode: 200,
      message: `Password reset successful. You can now login.`,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@RequestContext() ctx: RequestContextDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getMe.`);
      return this.authService.getMe(ctx.user)
    }

  private cookiesBuildTokenResponsive(response: Response, token: string) {
    const cookiesOptions = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    }
    return response.status(200).cookie('token', token, cookiesOptions)
  }
}
