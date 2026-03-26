import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InitPaymentDto } from './dto/payment.dto';
import { PaymentEntity } from './entities/payment.entity';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { SettingsService } from '@/modules/admin/settings/settings.service';
import { PaymentStatus } from '@/common/enums/payment-status.enum';
import { OrderStatus } from '@/common/enums/order-status.enum';
import { InvoiceStatus } from '@/common/enums/invoice-status.enum';
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service';
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
        private settingsService: SettingsService,
        private invoiceService: InvoiceService,
        private mailService: MailService,
    ) { }

    async initPayment(dto: InitPaymentDto, tenantId: string) {
        this.logger.log(`${this.initPayment.name} Service Called`);
        const { orderId, callbackUrl } = dto;

        const order = await this.orderRepository.findOne({
            where: { id: orderId, tenantId },
            relations: ['items', 'items.product'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const settings = await this.settingsService.findByTenantSettings(tenantId);


        const store_id = settings.payment?.sslCommerzStoreId;
        const store_passwd = settings.payment?.sslCommerzStorePassword;
        const is_live = !settings.payment?.sslCommerzIsSandbox;
        const app_url = callbackUrl

        if (!store_id || !store_passwd) {
            throw new BadRequestException('Payment gateway not configured');
        }

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
            success_url: `${app_url}/success?tran_id=${tran_id}`,
            fail_url: `${app_url}/fail?tran_id=${tran_id}`,
            cancel_url: `${app_url}/cancel?tran_id=${tran_id}`,
            ipn_url: `${app_url}/api/v1/payment/ipn`,
            shipping_method: 'Courier',
            product_name: order.items?.map(i => i.product?.name).join(', ').substring(0, 250) || 'Order Items',
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
            value_a: app_url,
            value_b: tenantId,
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

    async handleSuccessPayment(tran_id: string, gatewayResponse: any) {
        this.logger.log(`${this.handleSuccessPayment.name} Service Called`);
        const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatus.PAID;
        order.status = OrderStatus.PENDING;
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

        // Sync Invoice Status
        await this.invoiceService.updateInvoiceStatusByOrderId(order.id, InvoiceStatus.PAID, order.tenantId);

        // Notify Admin
        const orderWithRelations = await this.orderRepository.findOne({
            where: { id: order.id, tenantId: order.tenantId },
            relations: ['items', 'items.product', 'items.variant'],
        });
        if (orderWithRelations) {
            this.mailService.sendNewOrderNotification(orderWithRelations, order.tenantId);
        }

        return { success: true };
    }

    async handleFailPayment(tran_id: string, gatewayResponse: any) {
        this.logger.log(`${this.handleFailPayment.name} Service Called`);
        const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatus.FAILED;
        await this.orderRepository.save(order);

        // Record payment failure
        const payment = this.paymentRepository.create({
            orderId: order.id,
            transactionId: tran_id,
            amount: order.totalAmount,
            currency: order.currency,
            method: gatewayResponse.card_type || 'Unknown',
            status: 'FAILED',
            gatewayResponse,
            tenantId: order.tenantId,
        });
        await this.paymentRepository.save(payment);

        return { success: false };
    }

    async handleCancelPayment(tran_id: string, gatewayResponse: any) {
        this.logger.log(`${this.handleCancelPayment.name} Service Called`);
        const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatus.PENDING; // Or CANCELLED if you have that status
        await this.orderRepository.save(order);

        // Record payment cancellation
        const payment = this.paymentRepository.create({
            orderId: order.id,
            transactionId: tran_id,
            amount: order.totalAmount,
            currency: order.currency,
            method: gatewayResponse.card_type || 'Unknown',
            status: 'CANCELLED',
            gatewayResponse,
            tenantId: order.tenantId,
        });
        await this.paymentRepository.save(payment);

        return { cancelled: true };
    }

    async findAllPayments(tenantId: string) {
        this.logger.log(`${this.findAllPayments.name} Service Called`);
        return await this.paymentRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            relations: ['order'],
        });
    }

    async findAllPaymentsByCustomer(userId: string, tenantId: string) {
        this.logger.log(`${this.findAllPaymentsByCustomer.name} Service Called`);
        return await this.paymentRepository.find({
            where: { 
                tenantId,
                order: { userId }
            },
            order: { createdAt: 'DESC' },
            relations: ['order'],
        });
    }
}
