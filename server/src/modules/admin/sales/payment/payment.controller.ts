import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user/user-role.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.MARKETING)
    async findAllPayments(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPayments.`);
        return {
            success: true,
            data: await this.paymentService.findAllPayments(ctx.tenantId),
        };
    }
}
