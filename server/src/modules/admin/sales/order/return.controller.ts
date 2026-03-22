import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards, Logger
} from '@nestjs/common';
import { ReturnStatus } from '@/common/enums/return-status.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto';
import { ReturnService } from '@/modules/admin/sales/order/return.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnController {
    private readonly logger = new Logger(ReturnController.name);

    constructor(private readonly returnService: ReturnService) { }

    @Post()
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support, UserRole.Operator, UserRole.User)
    createReturnRequest(
        @RequestContext() ctx: RequestContextDto, @Body() dto: CreateReturnDto,
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReturnRequest.`);
        return this.returnService.createReturnRequest(ctx.userId, ctx.tenantId, dto);
    }

    @Get('my-returns')
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support, UserRole.Marketing, UserRole.Operator, UserRole.User)
    findMyReturns(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findMyReturns.`);
        return this.returnService.findByUser(ctx.userId, ctx.tenantId);
    }

    @Get()
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support, UserRole.Operator)
    findAllReturns(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllReturns.`);
        return this.returnService.findAllReturns(ctx.tenantId);
    }

    @Get(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support, UserRole.Operator)
    findReturnById(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findReturnById.`);
        return this.returnService.findOneReturn(id, ctx.tenantId);
    }

    @Patch(':id/status')
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Support)
    updateStatus(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body('status') status: ReturnStatus,
        @Body('comment') comment?: string,
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateStatus.`);
        return this.returnService.updateReturnRequestStatus(id, ctx.tenantId, status, comment);
    }
}
