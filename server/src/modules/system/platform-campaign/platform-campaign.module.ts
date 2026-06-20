import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'
import { PlatformCampaignEntity } from './entities/platform-campaign.entity'
import { PlatformCampaignMessageEntity } from './entities/platform-campaign-message.entity'
import { PlatformCampaignLogEntity } from './entities/platform-campaign-log.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SubscriberEntity } from '@/modules/admin/customer/subscriber/entities/subscriber.entity'
import { PlatformCampaignRepository } from './repositories/platform-campaign.repository'
import { PlatformCampaignMessageRepository } from './repositories/platform-campaign-message.repository'
import { PlatformCampaignLogRepository } from './repositories/platform-campaign-log.repository'
import { PlatformAudienceService } from './services/platform-audience.service'
import { PlatformCampaignService } from './services/platform-campaign.service'
import { PlatformCampaignController } from './controllers/platform-campaign.controller'
import { PlatformCampaignProcessor } from './queue/platform-campaign.processor'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SmsModule } from '@/modules/admin/operations/infra/sms/sms.module'
import { PushModule } from '@/modules/admin/operations/infra/push/push.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlatformCampaignEntity,
      PlatformCampaignMessageEntity,
      PlatformCampaignLogEntity,
      UserEntity,
      SubscriberEntity,
    ]),
    BullModule.registerQueue({ name: 'platform-campaign' }),
    forwardRef(() => MailModule),
    forwardRef(() => SmsModule),
    PushModule,
  ],
  providers: [
    PlatformCampaignRepository,
    PlatformCampaignMessageRepository,
    PlatformCampaignLogRepository,
    PlatformAudienceService,
    PlatformCampaignService,
    PlatformCampaignProcessor,
  ],
  controllers: [PlatformCampaignController],
  exports: [
    PlatformCampaignRepository,
    PlatformCampaignMessageRepository,
    PlatformCampaignLogRepository,
    PlatformAudienceService,
    PlatformCampaignService,
  ],
})
export class PlatformCampaignModule {}
