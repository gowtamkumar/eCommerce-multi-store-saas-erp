import { Body, Controller, Logger, Post } from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantService } from './tenant.service'
import { Public } from '@/common/decorators/public.decorator'

// Public: self-service store signup must be reachable by unauthenticated users.
@Public()
@Controller('onboard')
export class OnboardController {
  private readonly logger = new Logger(OnboardController.name)

  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async onboard(@Body() createTenantDto: CreateTenantDto) {
    this.logger.verbose('onboard called.')
    const result = await this.tenantService.createTenant(createTenantDto as CreateTenantDto)
    return {
      success: true,
      message: 'Store created successfully',
      subdomain: result.tenant.subdomain,
    }
  }
}
