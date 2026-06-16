import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { DebitNoteRepository } from '../repositories/debit-note.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { DebitNoteService } from './debit-note.service'

describe('DebitNoteService', () => {
  let service: DebitNoteService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebitNoteService,
        {
          provide: DebitNoteRepository,
          useValue: {},
        },
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
      ],
    }).compile()

    service = module.get<DebitNoteService>(DebitNoteService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
