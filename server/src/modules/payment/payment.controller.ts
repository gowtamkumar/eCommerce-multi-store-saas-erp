import { Controller, Post, Body, Get, Query, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitPaymentDto } from './dto/payment.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Request, Response } from 'express';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get()
    @ApiOperation({ summary: 'Get all payments (Admin)' })
    async findAll() {
        return await this.paymentService.findAll();
    }
}
