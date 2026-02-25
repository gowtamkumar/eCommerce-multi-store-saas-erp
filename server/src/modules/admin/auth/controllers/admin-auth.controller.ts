import { Body, Controller, Delete, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { TenantId } from 'src/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { LoginCredentialDto } from '../dtos'
import { AuthService } from '../services/auth.service'

@Controller('admin')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(
    @Body() loginCredentialDto: LoginCredentialDto,
    @TenantId() tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const authPayload = await this.authService.login(loginCredentialDto, tenantId)
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
