import { Test, TestingModule } from '@nestjs/testing'
import { NotificationGateway } from './notification.gateway'
import { NotificationService } from './notification.service'
import { NotificationRepository } from './repositories/notification.repository'
import { StoreRepository } from '@/modules/system/store/store.repository'

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            txRepo: jest.fn().mockReturnValue({
              createQueryBuilder: jest.fn(() => ({
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({}),
                getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
              })),
              count: jest.fn().mockResolvedValue(0),
            }),
          },
        },
        {
          provide: StoreRepository,
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<NotificationService>(NotificationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
