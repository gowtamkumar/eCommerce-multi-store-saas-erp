import { Test, TestingModule } from '@nestjs/testing'
import { ChatService } from './chat.service'
import { ConversationRepository } from './repositories/conversation.repository'
import { ChatMessageRepository } from './repositories/chat-message.repository'

const mockTxRepo = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn().mockResolvedValue([[], 0]),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  manager: {
    transaction: jest.fn((cb) => cb({
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({}),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      })),
    })),
  },
})

describe('ChatService', () => {
  let service: ChatService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ConversationRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            txRepo: jest.fn().mockReturnValue(mockTxRepo()),
          },
        },
        {
          provide: ChatMessageRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            txRepo: jest.fn().mockReturnValue(mockTxRepo()),
          },
        },
      ],
    }).compile()

    service = module.get<ChatService>(ChatService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
