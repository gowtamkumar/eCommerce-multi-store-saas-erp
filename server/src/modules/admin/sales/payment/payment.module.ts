import { InvoiceModule } from '@/modules/admin/operations/finance/invoice/invoice.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { Module } from '@nestjs/common'
import { PaymentActionController } from './controllers/payment-action.controller'
import { PaymentController } from './controllers/payment.controller'
import { PaymentService } from './services/payment.service'

@Module({
  imports: [SettingsModule, InvoiceModule, MailModule],
  controllers: [PaymentController, PaymentActionController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }
