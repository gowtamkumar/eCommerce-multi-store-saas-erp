import { Body, Controller, Post } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('onboard')
export class OnboardController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    async onboard(@Body() body: Record<string, string>) {
        // Map frontend legacy payload to CreateTenantDto
        const createTenantDto: CreateTenantDto = {
            storeName: body.storeName,
            subdomain: body.subdomain,
            planId: body.planId,
            adminName: body.name,
            adminUsername: body.username,
            adminEmail: body.email,
            adminPassword: body.password,
        };
        const result = await this.tenantService.create(createTenantDto);
        return {
            success: true,
            message: 'Store created successfully',
            subdomain: result.tenant.subdomain,
        };
    }
}
