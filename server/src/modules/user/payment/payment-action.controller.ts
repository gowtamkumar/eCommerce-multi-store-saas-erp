import { Body, Controller, Post, Query, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { InitPaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('payment')
export class PaymentActionController {
    private readonly logger = new Logger(PaymentActionController.name);

    constructor(private readonly paymentService: PaymentService) { }

    @Post('init')
    async init(@RequestContext() ctx: RequestContextDto, @Body() dto: InitPaymentDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called init.`);
        return await this.paymentService.initPayment(dto, ctx.tenantId);
    }

    @Post('success')
    async success(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleSuccessPayment(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/success?tran_id=${tran_id}`);
    }

    @Post('fail')
    async fail(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleFailPayment(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/fail?tran_id=${tran_id}`);
    }

    @Post('cancel')
    async cancel(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleCancelPayment(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/cancel?tran_id=${tran_id}`);
    }

    @Post('ipn')
    async ipn(@Body() gatewayResponse: any) {
        const { tran_id, status } = gatewayResponse;
        if (status === 'VALID' || status === 'AUTHENTICATED') {
            return await this.paymentService.handleSuccessPayment(tran_id, gatewayResponse);
        }
        return { received: true };
    }
}
