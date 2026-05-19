import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { SubscriberEntity } from '@/modules/admin/customer/subscriber/entities/subscriber.entity'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SmsModule } from '@/modules/admin/operations/infra/sms/sms.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PushModule } from '../../operations/infra/push/push.module'
import { CampaignController } from './controllers/campaign.controller'
import { CampaignLogEntity } from './entities/campaign-log.entity'
import { CampaignMessageEntity } from './entities/campaign-message.entity'
import { CampaignEntity } from './entities/campaign.entity'
import { CampaignProcessor } from './queue/campaign.processor'
import { CampaignLogRepository } from './repositories/campaign-log.repository'
import { CampaignMessageRepository } from './repositories/campaign-message.repository'
import { CampaignRepository } from './repositories/campaign.repository'
import { AudienceService } from './services/audience.service'
import { CampaignService } from './services/campaign.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CampaignEntity,
      CampaignMessageEntity,
      CampaignLogEntity,
      UserEntity,
      SubscriberEntity,
      LeadEntity,
    ]),
    BullModule.registerQueue({ name: 'campaign' }),
    MailModule,
    SmsModule,
    PushModule,
    TenantModule,
    NotificationModule,
  ],
  providers: [
    AudienceService,
    CampaignService,
    CampaignProcessor,
    CampaignRepository,
    CampaignMessageRepository,
    CampaignLogRepository,
  ],
  controllers: [CampaignController],
  exports: [
    TypeOrmModule,
    AudienceService,
    CampaignService,
    CampaignRepository,
    CampaignMessageRepository,
    CampaignLogRepository,
  ],
})
export class CampaignModule {}
