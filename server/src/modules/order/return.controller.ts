import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ReturnStatus } from '../../common/enums/return-status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserEntity } from '../admin/user/entities/user.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnService } from './return.service';

@ApiTags('Returns')
@Controller('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReturnController {
    constructor(private readonly returnService: ReturnService) { }

    @Post()
    create(
        @CurrentUser() user: UserEntity,
        @TenantId() tenantId: string,
        @Body() dto: CreateReturnDto,
    ) {
        return this.returnService.createRequest(user.id, tenantId, dto);
    }

    @Get('my-returns')
    findMyReturns(
        @CurrentUser() user: UserEntity,
        @TenantId() tenantId: string,
    ) {
        return this.returnService.findByUser(user.id, tenantId);
    }

    @Get()
    @UseGuards(RolesGuard)
    // @Roles(Roles.ADMIN) // Uncomment if Role guard is robust
    findAll(@TenantId() tenantId: string) {
        return this.returnService.findAll(tenantId);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard) // Admin only
    updateStatus(
        @Param('id') id: string,
        @TenantId() tenantId: string,
        @Body('status') status: ReturnStatus,
        @Body('comment') comment?: string,
    ) {
        return this.returnService.updateStatus(id, tenantId, status, comment);
    }
}
