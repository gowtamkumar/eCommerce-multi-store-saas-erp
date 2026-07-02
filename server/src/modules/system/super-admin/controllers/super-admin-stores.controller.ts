import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { StoreService } from '@/modules/system/store/store.service'
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
export class SuperAdminStoresController {
  private readonly logger = new Logger(SuperAdminStoresController.name)

  constructor(
    private readonly storeService: StoreService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('/stores')
  async getAllStores(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const stores = await this.storeService.findAllStores()

    let filtered = stores as any[]

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
      message: 'All stores retrieved successfully',
      data: filtered,
    }
  }

  @Get('/stores/analytics')
  async getStoreAnalytics(): Promise<BaseApiSuccessResponse<any[]>> {
    try {
      const analytics = await this.storeService.getBulkStoreAnalytics()
      return {
        success: true,
        statusCode: 200,
        message: 'Store analytics retrieved successfully',
        data: analytics,
      }
    } catch (error: any) {
      this.logger.error('[SuperAdmin] Error fetching store analytics:', error)
      throw error
    }
  }

  @Get('/stores/:id/analytics')
  async getDetailedStoreAnalytics(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    try {
      const data = await this.storeService.getDetailedAnalytics(id)
      return {
        success: true,
        statusCode: 200,
        message: 'Detailed store analytics retrieved',
        data,
      }
    } catch (error: any) {
      this.logger.error(
        `[SuperAdmin] Error fetching detailed analytics for store ${sanitizeLog(id)}:`,
        error,
      )
      throw error
    }
  }

  @Get('/stores/:id')
  async getStoreDetails(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    const store = await this.storeService.findOneStores(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Store details retrieved successfully',
      data: store as any,
    }
  }

  @Patch('/stores/:id/status')
  async updateStoreStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: StoreStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const store = await this.storeService.updateStoreStatus(id, status as any)
    await this.auditLogService.log(
      { storeId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'STORE_STATUS_CHANGE',
        entity: 'Store',
        entityId: id,
        newValue: { status },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: `Store status updated to ${status}`,
      data: store as any,
    }
  }

  @Patch('/stores/:id/plan')
  async updateStorePlan(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('planId') planId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.storeService.updateStorePlan(id, planId)
    await this.auditLogService.log(
      { storeId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'STORE_PLAN_CHANGE',
        entity: 'Store',
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

  // ─── Bulk Store Actions ─────────────────────────────────────────────────

  @Post('/stores/bulk-status')
  @HttpCode(200)
  async bulkUpdateStoreStatus(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[]; status: StoreStatus },
  ): Promise<BaseApiSuccessResponse<{ updated: number }>> {
    const { ids, status } = body
    let updated = 0
    for (const id of ids) {
      try {
        await this.storeService.updateStoreStatus(id, status as any)
        await this.auditLogService.log(
          { storeId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
          {
            userId: ctx.userId,
            actorName: ctx.user?.username,
            action: 'STORE_STATUS_CHANGE',
            entity: 'Store',
            entityId: id,
            newValue: { status },
          } as any,
        )
        updated++
      } catch (e: any) {
        this.logger.warn(`Bulk status update failed for store ${id}: ${e.message}`)
      }
    }
    return {
      success: true,
      statusCode: 200,
      message: `${updated} stores updated`,
      data: { updated },
    }
  }

  @Post('/stores/bulk-plan')
  @HttpCode(200)
  async bulkUpdateStorePlan(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[]; planId: string },
  ): Promise<BaseApiSuccessResponse<{ updated: number }>> {
    const { ids, planId } = body
    let updated = 0
    for (const id of ids) {
      try {
        await this.storeService.updateStorePlan(id, planId)
        await this.auditLogService.log(
          { storeId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
          {
            userId: ctx.userId,
            actorName: ctx.user?.username,
            action: 'STORE_PLAN_CHANGE',
            entity: 'Store',
            entityId: id,
            newValue: { planId },
          } as any,
        )
        updated++
      } catch (e: any) {
        this.logger.warn(`Bulk plan update failed for store ${id}: ${e.message}`)
      }
    }
    return {
      success: true,
      statusCode: 200,
      message: `${updated} stores updated`,
      data: { updated },
    }
  }

  @Get('/stores/:id/features')
  async getStoreFeatures(@Param('id') id: string): Promise<BaseApiSuccessResponse<any[]>> {
    const features = await this.storeService.getStoreFeatures(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Store features retrieved successfully',
      data: features,
    }
  }

  // ─── Analytics Export ────────────────────────────────────────────────────

  @Get('/analytics/export')
  async exportAnalyticsCSV(@Res() res: Response): Promise<void> {
    const stores = (await this.storeService.findAllStores()) as any[]

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
      ...stores.map((t) =>
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

  @Patch('/stores/:id/features')
  async updateStoreFeatureOverride(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: { featureSlug: string; overrideValue: boolean | null },
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.storeService.updateStoreFeatureOverride(
      id,
      body.featureSlug,
      body.overrideValue,
    )
    await this.auditLogService.log(
      { storeId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'STORE_FEATURE_OVERRIDE',
        entity: 'Store',
        entityId: id,
        newValue: { featureSlug: body.featureSlug, overrideValue: body.overrideValue },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Store feature override updated successfully',
      data: result,
    }
  }
}
