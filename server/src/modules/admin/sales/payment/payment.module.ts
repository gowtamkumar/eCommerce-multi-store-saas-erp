import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentActionController } from './payment-action.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SettingsModule } from '@/modules/admin/settings/settings.module';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { InvoiceModule } from '@/modules/admin/operations/finance/invoice/invoice.module';
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentEntity, OrderEntity]),
        SettingsModule,
        InvoiceModule,
        MailModule
    ],
    controllers: [PaymentController, PaymentActionController],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule { }
