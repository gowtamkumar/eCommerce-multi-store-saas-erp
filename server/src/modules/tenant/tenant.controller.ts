import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantLookupDto } from './dto/tenant-lookup.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new tenant with admin user' })
    @ApiResponse({ status: 201, description: 'Tenant created successfully' })
    @ApiResponse({ status: 409, description: 'Subdomain already exists' })
    async create(@Body() createTenantDto: CreateTenantDto) {
        return await this.tenantService.create(createTenantDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tenants' })
    @ApiResponse({ status: 200, description: 'Returns all tenants' })
    async findAll() {
        return await this.tenantService.findAll();
    }

    @Get('lookup')
    @ApiOperation({ summary: 'Lookup tenant by subdomain or custom domain' })
    @ApiResponse({ status: 200, description: 'Returns tenant details' })
    @ApiResponse({ status: 404, description: 'Tenant not found' })
    async lookup(@Query() query: TenantLookupDto) {
        return await this.tenantService.lookup(query.subdomain, query.customDomain);
    }
}
