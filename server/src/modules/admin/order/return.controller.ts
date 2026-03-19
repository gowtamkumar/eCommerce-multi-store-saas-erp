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
import { CreateReturnDto } from '@/modules/admin/order/dto/create-return.dto';
import { ReturnService } from '@/modules/admin/order/return.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnController {
    private readonly logger = new Logger(ReturnController.name);

    constructor(private readonly returnService: ReturnService) { }

    @Post()
    createReturnRequest(
        @RequestContext() ctx: RequestContextDto, @Body() dto: CreateReturnDto,
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReturnRequest.`);
        return this.returnService.createReturnRequest(ctx.userId, ctx.tenantId, dto);
    }

    @Get('my-returns')
    findMyReturns(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findMyReturns.`);
        return this.returnService.findByUser(ctx.userId, ctx.tenantId);
    }

    @Get()
    @UseGuards(RolesGuard)
    // @Roles(Roles.ADMIN) // Uncomment if Role guard is robust
    findAllReturns(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllReturns.`);
        return this.returnService.findAllReturns(ctx.tenantId);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard) // Admin only
    updateStatus(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body('status') status: ReturnStatus,
        @Body('comment') comment?: string,
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateStatus.`);
        return this.returnService.updateReturnRequestStatus(id, ctx.tenantId, status, comment);
    }
}
