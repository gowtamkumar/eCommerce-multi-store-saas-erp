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
    UseGuards, Logger
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
    private readonly logger = new Logger(AuditLogController.name);

    constructor(private readonly auditLogService: AuditLogService) { }

    /**
     * POST /audit-logs
     * Manually record an audit event (e.g. from client or other services).
     */
    @Post()
    async createAuditLog(
        @RequestContext() ctx: RequestContextDto, @Body() dto: CreateAuditLogDto,
        @Req() req: Request,
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createAuditLog.`);
        // Auto-fill userId from the JWT if not provided in body
        if (!dto.userId && ctx.user?.id) {
            dto.userId = ctx.userId;
        }

        const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress;

        const userAgent = req.headers['ctx.user-agent'];

        await this.auditLogService.log(ctx.tenantId, dto, ipAddress as string, userAgent as string);
        return { success: true, message: 'Audit log recorded' };
    }

    /**
     * GET /audit-logs
     * Paginated & filtered list of audit logs for the tenant.
     */
    @Get()
    async findAllAuditLogs(@RequestContext() ctx: RequestContextDto, @Query() query: QueryAuditLogDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllAuditLogs.`);
        return this.auditLogService.findAllAuditLogs(ctx.tenantId, query);
    }

    /**
     * GET /audit-logs/:id
     * Single audit log entry.
     */
    @Get(':id')
    async findOneAuditLog(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneAuditLog.`);
        return this.auditLogService.findOneAuditLog(id, ctx.tenantId);
    }

    /**
     * DELETE /audit-logs/retention/:days
     * Delete logs older than N days (data-retention / compliance).
     */
    @Delete('retention/:days')
    async purgeOldLogs(
        @RequestContext() ctx: RequestContextDto, @Param('days', ParseIntPipe) days: number
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called purgeOldLogs.`);
        return this.auditLogService.deleteOlderThanAuditLogs(ctx.tenantId, days);
    }
}
