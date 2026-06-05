import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'

function sanitizeLog(input: string | undefined | null): string {
  if (!input) return ''
  return input.replace(/[\r\n]/g, '_')
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminTenantsController {
  private readonly logger = new Logger(SuperAdminTenantsController.name)

  constructor(
    private readonly tenantService: TenantService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('/tenants')
  async getAllTenants(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const tenants = await this.tenantService.findAllTenants()

    let filtered = tenants as any[]

    if (search) {
      const term = search.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.storeName?.toLowerCase().includes(term) ||
          t.subdomain?.toLowerCase().includes(term) ||
          t.customDomain?.toLowerCase().includes(term),
      )
    }

    if (status) {
      filtered = filtered.filter((t) => t.status?.toLowerCase() === status.toLowerCase())
    }

    if (plan) {
      filtered = filtered.filter((t) =>
        t.subscriptionPlan?.name?.toLowerCase().includes(plan.toLowerCase()),
      )
    }

    if (sort === 'created_asc') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sort === 'created_desc') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'name_asc') {
      filtered.sort((a, b) => (a.storeName || '').localeCompare(b.storeName || ''))
    }

    // Add trial expiry countdown
    const now = new Date()
    filtered = filtered.map((t) => {
      const endsAt = t.subscriptionEndsAt ? new Date(t.subscriptionEndsAt) : null
      const daysUntilExpiry = endsAt
        ? Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null
      return { ...t, daysUntilExpiry }
    })

    return {
      success: true,
      statusCode: 200,
      message: 'All tenants retrieved successfully',
      data: filtered,
    }
  }

  @Get('/tenants/analytics')
  async getTenantAnalytics(): Promise<BaseApiSuccessResponse<any[]>> {
    try {
      const analytics = await this.tenantService.getBulkTenantAnalytics()
      return {
        success: true,
        statusCode: 200,
        message: 'Tenant analytics retrieved successfully',
        data: analytics,
      }
    } catch (error: any) {
      this.logger.error('[SuperAdmin] Error fetching tenant analytics:', error)
      throw error
    }
  }

  @Get('/tenants/:id/analytics')
  async getDetailedTenantAnalytics(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    try {
      const data = await this.tenantService.getDetailedAnalytics(id)
      return {
        success: true,
        statusCode: 200,
        message: 'Detailed tenant analytics retrieved',
        data,
      }
    } catch (error: any) {
      this.logger.error(
        `[SuperAdmin] Error fetching detailed analytics for tenant ${sanitizeLog(id)}:`,
        error,
      )
      throw error
    }
  }

  @Get('/tenants/:id')
  async getTenantDetails(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    const tenant = await this.tenantService.findOneTenants(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant details retrieved successfully',
      data: tenant as any,
    }
  }

  @Patch('/tenants/:id/status')
  async updateTenantStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: TenantStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const tenant = await this.tenantService.updateTenantStatus(id, status as any)
    await this.auditLogService.log(
      { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'TENANT_STATUS_CHANGE',
        entity: 'Tenant',
        entityId: id,
        newValue: { status },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: `Tenant status updated to ${status}`,
      data: tenant as any,
    }
  }

  @Patch('/tenants/:id/plan')
  async updateTenantPlan(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('planId') planId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.tenantService.updateTenantPlan(id, planId)
    await this.auditLogService.log(
      { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'TENANT_PLAN_CHANGE',
        entity: 'Tenant',
        entityId: id,
        newValue: { planId },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Plan updated successfully',
      data: null,
    }
  }

  // ─── Bulk Tenant Actions ─────────────────────────────────────────────────

  @Post('/tenants/bulk-status')
  @HttpCode(200)
  async bulkUpdateTenantStatus(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[]; status: TenantStatus },
  ): Promise<BaseApiSuccessResponse<{ updated: number }>> {
    const { ids, status } = body
    let updated = 0
    for (const id of ids) {
      try {
        await this.tenantService.updateTenantStatus(id, status as any)
        await this.auditLogService.log(
          { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
          {
            userId: ctx.userId,
            actorName: ctx.user?.username,
            action: 'TENANT_STATUS_CHANGE',
            entity: 'Tenant',
            entityId: id,
            newValue: { status },
          } as any,
        )
        updated++
      } catch (e: any) {
        this.logger.warn(`Bulk status update failed for tenant ${id}: ${e.message}`)
      }
    }
    return {
      success: true,
      statusCode: 200,
      message: `${updated} tenants updated`,
      data: { updated },
    }
  }

  @Post('/tenants/bulk-plan')
  @HttpCode(200)
  async bulkUpdateTenantPlan(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[]; planId: string },
  ): Promise<BaseApiSuccessResponse<{ updated: number }>> {
    const { ids, planId } = body
    let updated = 0
    for (const id of ids) {
      try {
        await this.tenantService.updateTenantPlan(id, planId)
        await this.auditLogService.log(
          { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
          {
            userId: ctx.userId,
            actorName: ctx.user?.username,
            action: 'TENANT_PLAN_CHANGE',
            entity: 'Tenant',
            entityId: id,
            newValue: { planId },
          } as any,
        )
        updated++
      } catch (e: any) {
        this.logger.warn(`Bulk plan update failed for tenant ${id}: ${e.message}`)
      }
    }
    return {
      success: true,
      statusCode: 200,
      message: `${updated} tenants updated`,
      data: { updated },
    }
  }

  @Get('/tenants/:id/features')
  async getTenantFeatures(@Param('id') id: string): Promise<BaseApiSuccessResponse<any[]>> {
    const features = await this.tenantService.getTenantFeatures(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant features retrieved successfully',
      data: features,
    }
  }

  // ─── Analytics Export ────────────────────────────────────────────────────

  @Get('/analytics/export')
  async exportAnalyticsCSV(@Res() res: Response): Promise<void> {
    const tenants = (await this.tenantService.findAllTenants()) as any[]

    const rows = [
      [
        'Store Name',
        'Subdomain',
        'Plan',
        'Status',
        'Subscription Status',
        'Subscription Ends',
        'Created At',
      ].join(','),
      ...tenants.map((t) =>
        [
          `"${(t.storeName || '').replace(/"/g, '""')}"`,
          t.subdomain || '',
          t.subscriptionPlan?.name || 'No Plan',
          t.status || '',
          t.subscriptionStatus || '',
          t.subscriptionEndsAt ? new Date(t.subscriptionEndsAt).toISOString() : '',
          t.createdAt ? new Date(t.createdAt).toISOString() : '',
        ].join(','),
      ),
    ]

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`)
    res.send(rows.join('\n'))
  }

  @Patch('/tenants/:id/features')
  async updateTenantFeatureOverride(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: { featureSlug: string; overrideValue: boolean | null },
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.tenantService.updateTenantFeatureOverride(
      id,
      body.featureSlug,
      body.overrideValue,
    )
    await this.auditLogService.log(
      { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'TENANT_FEATURE_OVERRIDE',
        entity: 'Tenant',
        entityId: id,
        newValue: { featureSlug: body.featureSlug, overrideValue: body.overrideValue },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant feature override updated successfully',
      data: result,
    }
  }
}
