import { Controller, Get } from '@nestjs/common'
import { SubscriptionPlanService } from './subscription-plan.service'

@Controller('plans')
export class PublicSubscriptionPlanController {
    constructor(private readonly planService: SubscriptionPlanService) { }

    @Get()
    findActive() {
        return this.planService.findActive()
    }
}
