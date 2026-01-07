import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '../order/entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { InitPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
        private configService: ConfigService,
    ) { }

    async init(dto: InitPaymentDto, tenantId: string) {
        const { orderId } = dto;

        const order = await this.orderRepository.findOne({
            where: { id: orderId, tenantId },
            relations: ['product'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const store_id = this.configService.get<string>('STORE_ID') || 'testbox';
        const store_passwd = this.configService.get<string>('STORE_PASSWORD') || 'qwerty';
        const is_live = this.configService.get<string>('NODE_ENV') === 'production';
        const app_url = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';

        const tran_id = `TRAN_${orderId}_${Date.now()}`;

        // Update order with transaction ID
        order.transactionId = tran_id;
        await this.orderRepository.save(order);

        const initData: any = {
            store_id,
            store_passwd,
            total_amount: (order.totalAmount / (order.currencyRate || 1)).toFixed(2),
            currency: order.currency || 'BDT',
            tran_id,
            success_url: `${app_url}/api/v1/payment/success?tran_id=${tran_id}`,
            fail_url: `${app_url}/api/v1/payment/fail?tran_id=${tran_id}`,
            cancel_url: `${app_url}/api/v1/payment/cancel?tran_id=${tran_id}`,
            ipn_url: `${app_url}/api/v1/payment/ipn`,
            shipping_method: 'Courier',
            product_name: order.product?.name || 'Product',
            product_category: 'General',
            product_profile: 'general',
            cus_name: order.customerName,
            cus_email: order.customerEmail,
            cus_add1: order.address,
            cus_add2: 'N/A',
            cus_city: 'N/A',
            cus_state: 'N/A',
            cus_postcode: 'N/A',
            cus_country: 'Bangladesh',
            cus_phone: order.customerPhone || '01700000000',
            cus_fax: order.customerPhone || '01700000000',
            ship_name: order.customerName,
            ship_add1: order.address,
            ship_add2: 'N/A',
            ship_city: 'N/A',
            ship_state: 'N/A',
            ship_postcode: 'N/A',
            ship_country: 'Bangladesh',
        };

        const apiUrl = is_live
            ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        const formData = new URLSearchParams();
        Object.entries(initData).forEach(([key, value]) => {
            formData.append(key, value as string);
        });

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const result: any = await response.json();

            if (result.status === 'SUCCESS') {
                return { gatewayUrl: result.GatewayPageURL };
            } else {
                throw new BadRequestException('Failed to initiate payment', result.failedreason);
            }
        } catch (error) {
            console.error('Payment init error:', error);
            throw new InternalServerErrorException('Failed to process payment with gateway');
        }
    }

    async handleSuccess(tran_id: string, gatewayResponse: any) {
        const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatus.PAID;
        order.status = OrderStatus.COMPLETED;
        await this.orderRepository.save(order);

        // Record payment
        const payment = this.paymentRepository.create({
            orderId: order.id,
            transactionId: tran_id,
            amount: order.totalAmount,
            currency: order.currency,
            method: gatewayResponse.card_type || 'Unknown',
            status: 'SUCCESS',
            gatewayResponse,
            tenantId: order.tenantId,
        });
        await this.paymentRepository.save(payment);

        return { success: true };
    }

    async handleFail(tran_id: string, gatewayResponse: any) {
        const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatus.FAILED;
        await this.orderRepository.save(order);

        return { success: false };
    }

    async handleCancel(tran_id: string, gatewayResponse: any) {
        const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatus.PENDING;
        await this.orderRepository.save(order);

        return { cancelled: true };
    }

    async findAll() {
        return await this.paymentRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['order'],
        });
    }
}
