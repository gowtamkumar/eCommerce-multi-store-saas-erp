import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ReturnStatus } from '../../common/enums/return-status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserEntity } from '../admin/user/entities/user.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnService } from './return.service';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnController {
    constructor(private readonly returnService: ReturnService) { }

    @Post()
    createReturnRequest(
        @CurrentUser() user: UserEntity,
        @TenantId() tenantId: string,
        @Body() dto: CreateReturnDto,
    ) {
        return this.returnService.createReturnRequest(user.id, tenantId, dto);
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
    findAllReturns(@TenantId() tenantId: string) {
        return this.returnService.findAllReturns(tenantId);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard) // Admin only
    updateStatus(
        @Param('id') id: string,
        @TenantId() tenantId: string,
        @Body('status') status: ReturnStatus,
        @Body('comment') comment?: string,
    ) {
        return this.returnService.updateReturnRequestStatus(id, tenantId, status, comment);
    }
}
