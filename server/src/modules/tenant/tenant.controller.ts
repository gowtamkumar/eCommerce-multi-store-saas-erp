import { Body, Controller, Get, Logger, Post, Put, Query } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { TenantService } from './tenant.service'

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
  async getTenantInfo(@TenantId() tenantId: string) {
    return await this.tenantService.findOneTenants(tenantId)
  }

  // @UseGuards(JwtAuthGuard)
  @Put('custom-domain')
  async updateCustomDomain(@TenantId() tenantId: string, @Body() body: { customDomain: string }) {
    return await this.tenantService.updateCustomDomain(tenantId, body.customDomain)
  }

  // @UseGuards(JwtAuthGuard)
  @Post('custom-domain/verify')
  async verifyCustomDomain(@TenantId() tenantId: string) {
    return await this.tenantService.verifyCustomDomain(tenantId)
  }
}
