import {
    Body,
    Controller,
    Delete,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginCredentialDto } from '../dtos';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';

@Controller('admin')
export class AdminAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    async login(
        @Body() loginCredentialDto: LoginCredentialDto,
        @TenantId() tenantId: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const authPayload = await this.authService.login(loginCredentialDto, tenantId);
        // set cookies token
        this.cookiesBuildTokenResponsive(res, authPayload.token);

        return {
            success: true,
            statusCode: 200,
            message: `Admin Login successful`,
            data: authPayload,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/logout')
    logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        //revoke token
        Object.entries(req.cookies).forEach(([key]) => res.clearCookie(key));

        return {
            success: true,
            statusCode: 200,
            message: `Logout successful`,
            data: null,
        };
    }

    private cookiesBuildTokenResponsive(response: Response, token: string) {
        const cookiesOptions = {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        };
        return response.status(200).cookie('token', token, cookiesOptions);
    }
}
