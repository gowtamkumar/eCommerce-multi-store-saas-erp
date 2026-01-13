import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get()
    @ApiOperation({ summary: 'Get all payments (Admin)' })
    async findAll(@TenantId() tenantId: string) {
        return {
            success: true,
            data: await this.paymentService.findAll(tenantId),
        };
    }
}
