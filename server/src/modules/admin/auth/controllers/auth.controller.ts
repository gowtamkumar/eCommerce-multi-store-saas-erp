import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginCredentialDto, RegisterCredentialDto } from '../dtos';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { UserDto } from '../../user/dtos';

import { TenantId } from '../../../../common/decorators/tenant-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  async register(
    @Body() registerCredentialDto: RegisterCredentialDto,
    @TenantId() tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authPayload = await this.authService.register(registerCredentialDto, tenantId);
    // set cookies token
    this.cookiesBuildTokenResponsive(res, authPayload.token);

    return {
      success: true,
      statusCode: 200,
      message: `Registration successful`,
      data: authPayload,
    };
  }

  @Post('/verify')
  async verify(
    @Body() body: { token: string },
  ) {
    const { token } = body;
    await this.authService.verifyEmail(token);
    return {
      success: true,
      statusCode: 200,
      message: `Email verified successfully`,
    };
  }

  @Post('/forgot-password')
  async forgotPassword(
    @Body() body: { email: string },
    @TenantId() tenantId: string,
  ) {
    const { email } = body;
    await this.authService.forgotPassword(email, tenantId);
    return {
      success: true,
      statusCode: 200,
      message: `If an account is associated with this email, you will receive a reset link shortly.`,
    };
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() body: { token: string; password: string },
  ) {
    const { token, password } = body;
    await this.authService.resetPassword(token, password);
    return {
      success: true,
      statusCode: 200,
      message: `Password reset successful. You can now login.`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@CurrentUser() user: UserDto) {
    return this.authService.getMe(user);
  }

  private cookiesBuildTokenResponsive(response: Response, token: string) {
    const cookiesOptions = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    };
    return response.status(200).cookie('token', token, cookiesOptions);
  }
}
