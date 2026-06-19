import { Audit } from '@/common/decorators/audit.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
// import { Throttle } from '@nestjs/throttler'
import { plainToInstance } from 'class-transformer'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { UpdateCustomDomainDto } from './dto/update-custom-domain.dto'
import {
  TenantAiConfigResponseDto,
  TestTenantAiConfigDto,
  UpdateTenantAiConfigDto,
} from './dto/tenant-ai-config.dto'
import { TenantResponseDto } from './dto/tenant-response.dto'
import { TenantEntity } from './entities/tenant.entity'
import { CreateTenantResponseDto, TenantService } from './tenant.service'
import { TenantAiClientService } from '@/modules/admin/ai/services/tenant-ai-client.service'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { ModuleRef } from '@nestjs/core'

/**
 * Convert a raw TenantEntity (which can carry internal/sensitive columns and
 * unloaded relations) into the safe response shape we ship over the wire.
 * `excludeExtraneousValues: true` ensures only `@Expose()`-ed fields on
 * TenantResponseDto are emitted, so a new sensitive column added to the
 * entity in the future cannot accidentally leak.
 */
function toTenantResponse(tenant: TenantEntity): TenantResponseDto {
  return plainToInstance(TenantResponseDto, tenant, {
    excludeExtraneousValues: true,
  })
}

/**
 * Public-facing tenant shape (storefront lookup by subdomain/custom domain).
 * Unauthenticated callers must never see per-domain verification tokens — they
 * are only meaningful to the tenant admin proving DNS ownership, so we strip
 * them here while keeping them on the authenticated `/tenants/info` response.
 */
function toPublicTenantResponse(tenant: TenantEntity): TenantResponseDto {
  const dto = toTenantResponse(tenant)
  if (Array.isArray(dto.domains)) {
    dto.domains = dto.domains.map((d) => ({ ...d, verificationToken: null }))
  }
  return dto
}

@Controller('tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name)
  constructor(
    private readonly tenantService: TenantService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Post()
  async create(
    @Body() createTenantDto: CreateTenantDto,
  ): Promise<BaseApiSuccessResponse<CreateTenantResponseDto>> {
    this.logger.log(`create`)
    const data = await this.tenantService.createTenant(createTenantDto)
    return {
      success: true,
      statusCode: 201,
      message: 'Tenant created successfully',
      data,
    }
  }

  @Get()
  async findAll(
    @Query() query: TenantLookupDto,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto[] | TenantResponseDto>> {
    if (query.subdomain || query.customDomain) {
      const findDomain = await this.tenantService.lookupTenant(query.subdomain, query.customDomain)
      return {
        success: true,
        statusCode: 200,
        message: 'Tenant lookup successful',
        data: toPublicTenantResponse(findDomain),
      }
    }

    const tenants = await this.tenantService.findAllTenants()
    return {
      success: true,
      statusCode: 200,
      message: 'Tenants retrieved successfully',
      data: tenants.map(toPublicTenantResponse),
    }
  }

  @Get('check-domain')
  async checkDomain(@Query('domain') domain: string): Promise<void> {
    if (!domain) {
      throw new BadRequestException('Domain query parameter is required')
    }
    const tenant = await this.tenantService.findByCustomDomain(domain)
    if (tenant) {
      return // 200 OK
    }
    throw new NotFoundException('Domain is not active or registered')
  }

  @Get('info')
  async getTenantInfo(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getTenantInfo.`)
    const tenant = await this.tenantService.findOneTenants(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant info retrieved successfully',
      data: toTenantResponse(tenant),
    }
  }

  // ───────────────────────────── Custom domain management ─────────────────
  // All custom-domain endpoints are tenant-scoped and require an explicit
  // SETTINGS_MANAGE permission. Anything that mutates the tenant's domain is
  // audited and never auto-marks the domain as ACTIVE — that only happens
  // after a successful TXT verification.

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  // @Throttle({ transactional: { limit: 10, ttl: 60000 } })
  @Patch('custom-domain')
  @Audit({ entity: 'Tenant', action: 'CUSTOM_DOMAIN_REQUEST' })
  async updateCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: UpdateCustomDomainDto,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto & { verificationInstructions: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCustomDomain.`)
    const result = await this.tenantService.requestCustomDomain(ctx.tenantId, body.customDomain)
    return {
      success: true,
      statusCode: 200,
      message:
        'Custom domain saved. Add the supplied DNS TXT record then call /tenants/custom-domain/verify.',
      data: {
        ...toTenantResponse(result),
        verificationInstructions: result.verificationInstructions,
      },
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('custom-domain/verify/:domainId')
  @Audit({ entity: 'Tenant', action: 'CUSTOM_DOMAIN_VERIFY' })
  async verifyCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Param('domainId') domainId: string,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called verifyCustomDomain.`)
    const tenant = await this.tenantService.verifyCustomDomain(ctx.tenantId, domainId)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain verified successfully',
      data: toTenantResponse(tenant),
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Delete('custom-domain/:domainId')
  @Audit({ entity: 'Tenant', action: 'CUSTOM_DOMAIN_DETACH' })
  async detachCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Param('domainId') domainId: string,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called detachCustomDomain.`)
    const tenant = await this.tenantService.detachCustomDomain(ctx.tenantId, domainId)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain removed',
      data: toTenantResponse(tenant),
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Patch('custom-domain/primary/:domainId')
  @Audit({ entity: 'Tenant', action: 'CUSTOM_DOMAIN_PRIMARY' })
  async setPrimaryCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Param('domainId') domainId: string,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called setPrimaryCustomDomain.`)
    const tenant = await this.tenantService.setPrimaryCustomDomain(ctx.tenantId, domainId)
    return {
      success: true,
      statusCode: 200,
      message: 'Primary custom domain set successfully',
      data: toTenantResponse(tenant),
    }
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('settings')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Get('ai-config')
  async getAiConfig(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<TenantAiConfigResponseDto>> {
    const data = await this.tenantService.getTenantAiConfig(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'AI configuration retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('settings')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Patch('ai-config')
  @Audit({ entity: 'Tenant', action: 'AI_CONFIG_UPDATE' })
  async updateAiConfig(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: UpdateTenantAiConfigDto,
  ): Promise<BaseApiSuccessResponse<TenantAiConfigResponseDto>> {
    const data = await this.tenantService.updateTenantAiConfig(ctx.tenantId, body)
    return {
      success: true,
      statusCode: 200,
      message: 'AI configuration updated successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('settings')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('ai-config/test')
  @HttpCode(200)
  async testAiConfig(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: TestTenantAiConfigDto,
  ): Promise<BaseApiSuccessResponse<{ reply: string; model: string; totalTokens: number }>> {
    const tenantAiClientService = this.moduleRef.get(TenantAiClientService, { strict: false })
    const result = await tenantAiClientService.testConnection(
      ctx.tenantId,
      body.prompt || 'Reply with exactly: OK',
    )
    return {
      success: true,
      statusCode: 200,
      message: 'AI connection successful',
      data: {
        reply: result.content,
        model: result.model,
        totalTokens: result.totalTokens,
      },
    }
  }
}
