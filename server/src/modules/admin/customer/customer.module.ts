import { Module } from '@nestjs/common'
import { LeadModule } from './lead/lead.module'
import { SubscriberModule } from './subscriber/subscriber.module'

@Module({
  imports: [LeadModule, SubscriberModule],
  exports: [LeadModule, SubscriberModule],
})
export class CustomerModule {}
