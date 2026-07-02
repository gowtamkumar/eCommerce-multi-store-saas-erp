import { Module } from '@nestjs/common'
import { CustomerController } from './customer.controller'
import { UserModule } from '../core/user/user.module'
import { LeadModule } from './lead/lead.module'
import { SubscriberModule } from './subscriber/subscriber.module'

import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [LeadModule, SubscriberModule, UserModule, StoreModule],
  controllers: [CustomerController],
  exports: [LeadModule, SubscriberModule],
})
export class CustomerModule {}
