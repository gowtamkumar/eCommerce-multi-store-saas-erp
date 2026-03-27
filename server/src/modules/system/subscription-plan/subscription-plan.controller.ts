import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanService } from './subscription-plan.service'

@Controller('super-admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SubscriptionPlanController {
  constructor(private readonly planService: SubscriptionPlanService) { }

  @Post()
  createSubscriptionPlan(@Body() createDto: CreateSubscriptionPlanDto) {
    return this.planService.createSubscriptionPlan(createDto)
  }

  @Get()
  findAllSubscriptionPlans() {
    return this.planService.findAllSubscriptionPlans()
  }

  @Get(':id')
  findOneSubscriptionPlan(@Param('id') id: string) {
    return this.planService.findOneSubscriptionPlan(id)
  }

  @Patch(':id')
  updateSubscriptionPlan(@Param('id') id: string, @Body() updateDto: UpdateSubscriptionPlanDto) {
    return this.planService.updateSubscriptionPlan(id, updateDto)
  }

  @Delete(':id')
  removeSubscriptionPlan(@Param('id') id: string) {
    return this.planService.removeSubscriptionPlan(id)
  }
}
