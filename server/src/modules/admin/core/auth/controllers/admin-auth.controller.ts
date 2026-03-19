import { Body, Controller, Delete, Post, Req, Res, UseGuards, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { LoginCredentialDto } from '@/modules/admin/core/auth/dtos'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('admin')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  async login(
    @RequestContext() ctx: RequestContextDto, @Body() loginCredentialDto: LoginCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called login.`);
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
      console.error('Login Error:', error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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

  private cookiesBuildTokenResponsive(response: Response, token: string) {
    const cookiesOptions = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    }
    return response.status(200).cookie('token', token, cookiesOptions)
  }
}
