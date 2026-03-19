import { Controller, Get, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    @Get()
    async findAllPayments(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPayments.`);
        return {
            success: true,
            data: await this.paymentService.findAllPayments(ctx.tenantId),
        };
    }
}
