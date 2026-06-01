import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { AuditLogService } from './audit-log.service'
import { AuditLogResponseDto } from './dto/audit-log-response.dto'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { QueryAuditLogDto } from './dto/query-audit-log.dto'

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name)

  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * POST /audit-logs
   * Manually record an audit event. Restricted to settings managers so untrusted
   * users cannot forge or spam the security evidence trail.
   */
  @Post()
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async createAuditLog(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateAuditLogDto,
    @Req() req: Request,
  ): Promise<BaseApiSuccessResponse<{ success: boolean }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createAuditLog.`)
    // Never trust caller-supplied actors; the JWT is the source of truth.
    dto.userId = ctx.userId

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress

    const userAgent = req.headers['user-agent']

    await this.auditLogService.log(ctx, dto, ipAddress as string, userAgent as string)
    return {
      success: true,
      statusCode: 201,
      message: 'Audit log recorded successfully',
      data: { success: true },
    }
  }

  /**
   * GET /audit-logs
   * Paginated & filtered list of audit logs for the tenant.
   */
  @Get()
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async findAllAuditLogs(
    @RequestContext() ctx: RequestContextDto,
    @Query() query: QueryAuditLogDto,
  ): Promise<BaseApiSuccessResponse<{ data: AuditLogResponseDto[]; meta: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllAuditLogs.`)
    const result = await this.auditLogService.findAllAuditLogs(ctx, query)
    return {
      success: true,
      statusCode: 200,
      message: 'Audit logs retrieved successfully',
      data: result as any,
    }
  }

  /**
   * GET /audit-logs/:id
   * Single audit log entry.
   */
  @Get(':id')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async findOneAuditLog(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<AuditLogResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneAuditLog.`)
    const entry = await this.auditLogService.findOneAuditLog(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Audit log entry retrieved successfully',
      data: entry as any,
    }
  }

  /**
   * DELETE /audit-logs/retention/:days
   * Delete logs older than N days (data-retention / compliance).
   */
  @Delete('retention/:days')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async purgeOldLogs(
    @RequestContext() ctx: RequestContextDto,
    @Param('days', ParseIntPipe) days: number,
  ): Promise<BaseApiSuccessResponse<{ message: string }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called purgeOldLogs.`)
    const result = await this.auditLogService.deleteOlderThanAuditLogs(ctx, days)
    return {
      success: true,
      statusCode: 200,
      message: 'Old audit logs purged successfully',
      data: result,
    }
  }
}
