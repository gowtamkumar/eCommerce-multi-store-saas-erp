import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Body, Controller, Get, Logger, Post, Put, Query } from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { CreateTenantResponseDto, TenantService } from './tenant.service'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { TenantResponseDto } from './dto/tenant-response.dto'

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

  @Put('custom-domain')
  async updateCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { customDomain: string },
  ): Promise<BaseApiSuccessResponse<TenantResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCustomDomain.`)
    const tenant = await this.tenantService.updateCustomDomain(ctx.tenantId, body.customDomain)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain updated successfully',
      data: tenant as any,
    }
  }

  @Post('custom-domain/verify')
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
}
