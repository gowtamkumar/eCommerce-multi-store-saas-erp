import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    /**
     * POST /audit-logs
     * Manually record an audit event (e.g. from client or other services).
     */
    @Post()
    async create(
        @Body() dto: CreateAuditLogDto,
        @TenantId() tenantId: string,
        @CurrentUser() user: any,
        @Req() req: Request,
    ) {
        // Auto-fill userId from the JWT if not provided in body
        if (!dto.userId && user?.id) {
            dto.userId = user.id;
        }

        const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress;

        const userAgent = req.headers['user-agent'];

        await this.auditLogService.log(tenantId, dto, ipAddress, userAgent);
        return { success: true, message: 'Audit log recorded' };
    }

    /**
     * GET /audit-logs
     * Paginated & filtered list of audit logs for the tenant.
     */
    @Get()
    async findAll(@TenantId() tenantId: string, @Query() query: QueryAuditLogDto) {
        return this.auditLogService.findAll(tenantId, query);
    }

    /**
     * GET /audit-logs/:id
     * Single audit log entry.
     */
    @Get(':id')
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.auditLogService.findOne(id, tenantId);
    }

    /**
     * DELETE /audit-logs/retention/:days
     * Delete logs older than N days (data-retention / compliance).
     */
    @Delete('retention/:days')
    async purgeOldLogs(
        @Param('days', ParseIntPipe) days: number,
        @TenantId() tenantId: string,
    ) {
        return this.auditLogService.deleteOlderThan(tenantId, days);
    }
}
