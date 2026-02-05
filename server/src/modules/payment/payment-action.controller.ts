import { Body, Controller, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { InitPaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentActionController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('init')
    async init(@Body() dto: InitPaymentDto, @TenantId() tenantId: string) {
        return await this.paymentService.init(dto, tenantId);
    }

    @Post('success')
    async success(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleSuccess(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/success?tran_id=${tran_id}`);
    }

    @Post('fail')
    async fail(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleFail(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/fail?tran_id=${tran_id}`);
    }

    @Post('cancel')
    async cancel(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleCancel(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/cancel?tran_id=${tran_id}`);
    }

    @Post('ipn')
    async ipn(@Body() gatewayResponse: any) {
        const { tran_id, status } = gatewayResponse;
        if (status === 'VALID' || status === 'AUTHENTICATED') {
            return await this.paymentService.handleSuccess(tran_id, gatewayResponse);
        }
        return { received: true };
    }
}
