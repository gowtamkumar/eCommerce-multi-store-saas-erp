import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CampaignLogEntity } from './entities/campaign-log.entity'
import { BullModule } from '@nestjs/bullmq'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SmsModule } from '@/modules/admin/operations/infra/sms/sms.module'
import { AudienceService } from './services/audience.service'
import { CampaignService } from './services/campaign.service'
import { CampaignProcessor } from './queue/campaign.processor'
import { CampaignController } from './controllers/campaign.controller'
import { CampaignEntity } from './entities/campaign.entity'
import { CampaignMessageEntity } from './entities/campaign-message.entity'
import { PushModule } from '../../operations/infra/push/push.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CampaignEntity,
      CampaignMessageEntity,
      CampaignLogEntity,
      UserEntity,
    ]),
    BullModule.registerQueue({ name: 'campaign' }),
    MailModule,
    SmsModule,
    PushModule,
  ],
  providers: [AudienceService, CampaignService, CampaignProcessor],
  controllers: [CampaignController],
  exports: [TypeOrmModule, AudienceService, CampaignService],
})
export class CampaignModule { }
