import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SubscriptionPlanService } from './subscription-plan.service'

@ApiTags('Public - Plans')
@Controller('plans')
export class PublicSubscriptionPlanController {
    constructor(private readonly planService: SubscriptionPlanService) { }

    @Get()
    @ApiOperation({ summary: 'List all active subscription plans' })
    findActive() {
        return this.planService.findActive()
    }
}
