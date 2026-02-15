import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../../common/enums/user/user-role.enum'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanService } from './subscription-plan.service'

@Controller('super-admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SuperAdmin)
export class SubscriptionPlanController {
  constructor(private readonly planService: SubscriptionPlanService) {}

  @Post()
  create(@Body() createDto: CreateSubscriptionPlanDto) {
    return this.planService.create(createDto)
  }

  @Get()
  findAll() {
    return this.planService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log("testing...asdfasdf", id);
    
    return this.planService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSubscriptionPlanDto) {
    return this.planService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planService.remove(id)
  }
}
