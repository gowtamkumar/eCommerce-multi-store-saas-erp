import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';

@ApiTags('Tenants')
@Controller('tenant')
export class TenantLookupController {
    constructor(private readonly tenantService: TenantService) { }

    @Get('lookup')
    @ApiOperation({ summary: 'Lookup tenant by subdomain or custom domain (Legacy Path)' })
    @ApiResponse({ status: 200, description: 'Returns tenant status and ID' })
    @ApiResponse({ status: 404, description: 'Tenant not found' })
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
