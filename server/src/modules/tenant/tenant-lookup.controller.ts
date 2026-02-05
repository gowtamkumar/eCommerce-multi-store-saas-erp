import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantLookupController {
    constructor(private readonly tenantService: TenantService) { }

    @Get('lookup')
    async lookup(@Query('domain') domain?: string, @Query('subdomain') subdomain?: string) {
        // Original API returned { success: true, tenantId: ... }
        try {
            const tenant = await this.tenantService.lookup(subdomain, domain);
            return {
                success: true,
                tenantId: tenant.id
            };
        } catch (error) {
            return {
                success: false,
                error: 'Tenant not found'
            };
        }
    }
}
