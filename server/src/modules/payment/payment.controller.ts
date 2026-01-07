import { Controller, Post, Body, Get, Query, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitPaymentDto } from './dto/payment.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Request, Response } from 'express';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('init')
    @ApiOperation({ summary: 'Initiate payment with SSLCommerz' })
    async init(@Body() dto: InitPaymentDto, @TenantId() tenantId: string) {
        return await this.paymentService.init(dto, tenantId);
    }

    @Post('success')
    @ApiOperation({ summary: 'Payment success callback' })
    async success(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleSuccess(tran_id, gatewayResponse);
        // Redirect to frontend success page
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/success?tran_id=${tran_id}`);
    }

    @Post('fail')
    @ApiOperation({ summary: 'Payment failure callback' })
    async fail(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleFail(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/fail?tran_id=${tran_id}`);
    }

    @Post('cancel')
    @ApiOperation({ summary: 'Payment cancellation callback' })
    async cancel(@Query('tran_id') tran_id: string, @Body() gatewayResponse: any, @Res() res: Response) {
        await this.paymentService.handleCancel(tran_id, gatewayResponse);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return res.redirect(`${appUrl}/payment/cancel?tran_id=${tran_id}`);
    }

    @Post('ipn')
    @ApiOperation({ summary: 'SSLCommerz IPN handler' })
    async ipn(@Body() gatewayResponse: any) {
        const { tran_id, status } = gatewayResponse;
        if (status === 'VALID' || status === 'AUTHENTICATED') {
            return await this.paymentService.handleSuccess(tran_id, gatewayResponse);
        }
        return { received: true };
    }

    @Get()
    @ApiOperation({ summary: 'Get all payments (Admin)' })
    async findAll() {
        return await this.paymentService.findAll();
    }
}
