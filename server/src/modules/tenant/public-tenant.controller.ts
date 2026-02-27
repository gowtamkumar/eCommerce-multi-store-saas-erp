import { Body, Controller, Post } from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantService } from './tenant.service'

@Controller('onboard')
export class OnboardController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async onboard(@Body() createTenantDto: CreateTenantDto) {
    const result = await this.tenantService.create(createTenantDto as CreateTenantDto)
    return {
      success: true,
      message: 'Store created successfully',
      subdomain: result.tenant.subdomain,
    }
  }
}
