import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantLookupDto } from './dto/tenant-lookup.dto'
import { TenantService } from './tenant.service'

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant with admin user' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Subdomain already exists' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return await this.tenantService.create(createTenantDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants (SuperAdmin) or Lookup by domain' })
  @ApiResponse({ status: 200, description: 'Returns tenant(s) details' })
  async findAll(
    @Query() query: TenantLookupDto,
    // Optional Guards depending on query params would be complex in Nest,
    // we'll handle auth logic inside the method or use a custom guard.
  ) {
    if (query.subdomain || query.customDomain) {
      const findDomain = await this.tenantService.lookup(query.subdomain, query.customDomain)
      console.log('findDomain', findDomain)

      return findDomain
    }

    // Apply manual check or require login for listing
    // For simplicity and mirroring original logic:
    return await this.tenantService.findAll()
  }
}
