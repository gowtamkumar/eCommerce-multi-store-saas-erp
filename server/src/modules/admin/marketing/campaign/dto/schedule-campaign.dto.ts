import { IsNotEmpty, IsDateString } from 'class-validator'

export class ScheduleCampaignDto {
  @IsDateString()
  @IsNotEmpty()
  scheduleTime: string
}
