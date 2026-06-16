import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { CampaignLogRepository } from '../repositories/campaign-log.repository'
import { CampaignMessageRepository } from '../repositories/campaign-message.repository'
import { CampaignRepository } from '../repositories/campaign.repository'
import { CampaignService } from './campaign.service'

describe('CampaignService', () => {
  let service: CampaignService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: CampaignRepository,
          useValue: {},
        },
        {
          provide: CampaignMessageRepository,
          useValue: {},
        },
        {
          provide: CampaignLogRepository,
          useValue: {},
        },
        {
          provide: getQueueToken('campaign'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<CampaignService>(CampaignService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
