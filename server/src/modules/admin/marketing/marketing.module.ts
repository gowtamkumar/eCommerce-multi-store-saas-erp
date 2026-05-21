import { Module } from '@nestjs/common'
import { CampaignModule } from './campaign/campaign.module'
import { LoyaltyModule } from './loyalty/loyalty.module'

@Module({
  imports: [CampaignModule, LoyaltyModule],
  exports: [CampaignModule, LoyaltyModule],
})
export class MarketingModule {}
