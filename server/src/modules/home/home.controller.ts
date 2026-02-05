import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }

    @Get()
    async getHomeData(@TenantId() tenantId: string) {
        return await this.homeService.getHomeData(tenantId);
    }
}
