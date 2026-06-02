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
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { UpdateCustomDomainDto } from './dto/update-custom-domain.dto'
import { TenantResponseDto } from './dto/tenant-response.dto'
import { TenantEntity } from './entities/tenant.entity'
import { CreateTenantResponseDto, TenantService } from './tenant.service'

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

@Controller('tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name)
  constructor(private readonly tenantService: TenantService) {}

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
        data: toTenantResponse(findDomain),
      }
    }

    const tenants = await this.tenantService.findAllTenants()
    return {
      success: true,
      statusCode: 200,
      message: 'Tenants retrieved successfully',
      data: tenants.map(toTenantResponse),
    }
  }

  @Get('check-domain')
  async checkDomain(
    @Query('domain') domain: string,
  ): Promise<void> {
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
}
