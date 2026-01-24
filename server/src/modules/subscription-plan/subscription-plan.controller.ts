import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserRole } from '../../common/enums/user/user-role.enum'
import { Roles } from '../admin/auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../admin/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../admin/auth/guards/roles.guard'
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto'
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto'
import { SubscriptionPlanService } from './subscription-plan.service'

@ApiTags('Super Admin - Plans')
@Controller('super-admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SuperAdmin)
export class SubscriptionPlanController {
    constructor(private readonly planService: SubscriptionPlanService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new subscription plan' })
    @ApiResponse({ status: 201, description: 'Plan created successfully' })
    create(@Body() createDto: CreateSubscriptionPlanDto) {
        return this.planService.create(createDto)
    }

    @Get()
    @ApiOperation({ summary: 'List all subscription plans' })
    findAll() {
        return this.planService.findAll()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a subscription plan by ID' })
    findOne(@Param('id') id: string) {
        return this.planService.findOne(id)
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a subscription plan' })
    update(@Param('id') id: string, @Body() updateDto: UpdateSubscriptionPlanDto) {
        return this.planService.update(id, updateDto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a subscription plan' })
    remove(@Param('id') id: string) {
        return this.planService.remove(id)
    }
}
