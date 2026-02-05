import { Controller, Get } from '@nestjs/common';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get()
    async findAll(@TenantId() tenantId: string) {
        return {
            success: true,
            data: await this.paymentService.findAll(tenantId),
        };
    }
}
