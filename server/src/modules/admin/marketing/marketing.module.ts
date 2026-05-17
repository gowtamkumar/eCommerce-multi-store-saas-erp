import { Module } from '@nestjs/common'
import { CampaignModule } from './campaign/campaign.module'

@Module({
  imports: [CampaignModule],
  exports: [CampaignModule],
})
export class MarketingModule {}
