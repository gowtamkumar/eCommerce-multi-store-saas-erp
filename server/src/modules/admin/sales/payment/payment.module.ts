import { InvoiceModule } from '@/modules/admin/operations/finance/invoice/invoice.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { Module } from '@nestjs/common'
import { PaymentActionController } from './controllers/payment-action.controller'
import { PaymentController } from './controllers/payment.controller'
import { PaymentService } from './services/payment.service'

import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [
    SettingsModule,
    InvoiceModule,
    MailModule,
    NotificationModule,
    TenantModule,
    AuditLogModule,
  ],
  controllers: [PaymentController, PaymentActionController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
