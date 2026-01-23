import { Body, Controller, Post, Headers, Req } from '@nestjs/common';
import { TrafficService } from '../super-admin/traffic.service';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trafficService: TrafficService) { }

    @Post('page-view')
    async trackPageView(
        @Body() body: { path: string },
        @Headers('x-tenant-id') tenantId: string,
        @Req() req: any
    ) {
        // Fallback to finding tenant ID from request property if middleware attached it
        const finalTenantId = tenantId || req.tenantId;

        if (finalTenantId && body.path) {
            // Fire and forget - don't await to keep response fast
            this.trafficService.logPageHit(finalTenantId, body.path);
        }

        return { success: true };
    }
}
