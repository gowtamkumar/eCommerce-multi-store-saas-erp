import { Module } from '@nestjs/common'
import { UserModule } from '../core/user/user.module'
import { CustomerController } from './customer.controller'
import { LeadModule } from './lead/lead.module'
import { SubscriberModule } from './subscriber/subscriber.module'

@Module({
  imports: [LeadModule, SubscriberModule, UserModule],
  controllers: [CustomerController],
  exports: [LeadModule, SubscriberModule],
})
export class CustomerModule {}
