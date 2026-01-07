import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Home')
@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }

    @Get()
    @ApiOperation({ summary: 'Get home page aggregated data' })
    async getHomeData(@TenantId() tenantId: string) {
        return await this.homeService.getHomeData(tenantId);
    }
}
