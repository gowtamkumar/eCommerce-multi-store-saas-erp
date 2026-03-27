import { Body, Controller, Get, Logger, Post, Put, Query } from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { TenantService } from './tenant.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Controller('tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name)
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    this.logger.log(`create`)
    return await this.tenantService.createTenant(createTenantDto)
  }

  @Get()
  async findAll(
    @Query() query: TenantLookupDto,
    // Optional Guards depending on query params would be complex in Nest,
    // we'll handle auth logic inside the method or use a custom guard.
  ) {
    if (query.subdomain || query.customDomain) {
      const findDomain = await this.tenantService.lookupTenant(query.subdomain, query.customDomain)
      return findDomain
    }

    // Apply manual check or require login for listing
    // For simplicity and mirroring original logic:
    return await this.tenantService.findAllTenants()
  }

  // @UseGuards(JwtAuthGuard)
  @Get('info')
  async getTenantInfo(@RequestContext() ctx: RequestContextDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getTenantInfo.`)
    return await this.tenantService.findOneTenants(ctx.tenantId)
  }

  // @UseGuards(JwtAuthGuard)
  @Put('custom-domain')
  async updateCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { customDomain: string },
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCustomDomain.`)
    return await this.tenantService.updateCustomDomain(ctx.tenantId, body.customDomain)
  }

  // @UseGuards(JwtAuthGuard)
  @Post('custom-domain/verify')
  async verifyCustomDomain(@RequestContext() ctx: RequestContextDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called verifyCustomDomain.`)
    return await this.tenantService.verifyCustomDomain(ctx.tenantId)
  }
}
