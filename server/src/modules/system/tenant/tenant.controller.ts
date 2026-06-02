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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { UpdateCustomDomainDto } from './dto/update-custom-domain.dto'
import { TenantResponseDto } from './dto/tenant-response.dto'
import { CreateTenantResponseDto, TenantService } from './tenant.service'

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
        data: findDomain as any,
      }
    }

    const tenants = await this.tenantService.findAllTenants()
    return {
      success: true,
      statusCode: 200,
      message: 'Tenants retrieved successfully',
      data: tenants as any,
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
    if (tenant && tenant.customDomainStatus === CustomDomainStatus.ACTIVE) {
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
      data: tenant as any,
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
      data: result as any,
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Post('custom-domain/verify')
  @Audit({ entity: 'Tenant', action: 'CUSTOM_DOMAIN_VERIFY' })
  async verifyCustomDomain(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called verifyCustomDomain.`)
    const tenant = await this.tenantService.verifyCustomDomain(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain verified successfully',
      data: tenant as any,
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Delete('custom-domain')
  @Audit({ entity: 'Tenant', action: 'CUSTOM_DOMAIN_DETACH' })
  async detachCustomDomain(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called detachCustomDomain.`)
    const tenant = await this.tenantService.detachCustomDomain(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain removed',
      data: tenant as any,
    }
  }
}
