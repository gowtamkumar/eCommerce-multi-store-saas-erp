import { Module } from '@nestjs/common'
import { CustomerController } from './customer.controller'
import { UserModule } from '../core/user/user.module'
import { LeadModule } from './lead/lead.module'
import { SubscriberModule } from './subscriber/subscriber.module'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [LeadModule, SubscriberModule, UserModule, TenantModule],
  controllers: [CustomerController],
  exports: [LeadModule, SubscriberModule],
})
export class CustomerModule { }
