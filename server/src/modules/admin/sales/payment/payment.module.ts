import { InvoiceModule } from '@/modules/admin/operations/finance/invoice/invoice.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentEntity } from './entities/payment.entity'
import { PaymentRepository } from './repositories/payment.repository'
import { OrderModule } from '../order/order.module'
import { PaymentActionController } from './controllers/payment-action.controller'
import { PaymentController } from './controllers/payment.controller'
import { PaymentService } from './services/payment.service'

import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    forwardRef(() => OrderModule),
    SettingsModule,
    forwardRef(() => InvoiceModule),
    MailModule,
    NotificationModule,
    TenantModule,
    AuditLogModule,
  ],
  controllers: [PaymentController, PaymentActionController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
