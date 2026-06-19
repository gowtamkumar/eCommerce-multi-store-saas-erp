import { AiJobStatus } from '@/common/enums/ai-job-status.enum'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bullmq'
import { Repository } from 'typeorm'
import { AiJobEntity } from '../entities/ai-job.entity'

export interface AiJobResponseDto {
  id: string
  tenantId: string
  type: AiJobType
  status: AiJobStatus
  payload: Record<string, unknown> | null
  result: Record<string, unknown> | null
  error: string | null
  totalTokens: number
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
}

@Injectable()
export class AiJobService {
  constructor(
    @InjectRepository(AiJobEntity)
    private readonly jobRepo: Repository<AiJobEntity>,
    @InjectQueue('ai') private readonly aiQueue: Queue,
  ) {}

  toResponse(job: AiJobEntity): AiJobResponseDto {
    return {
      id: job.id,
      tenantId: job.tenantId,
      type: job.type,
      status: job.status,
      payload: job.payload,
      result: job.result,
      error: job.error,
      totalTokens: job.totalTokens,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    }
  }

  async findByIdForTenant(jobId: string, tenantId: string): Promise<AiJobEntity> {
    const job = await this.jobRepo.findOne({ where: { id: jobId, tenantId } })
    if (!job) {
      throw new NotFoundException('AI job not found')
    }
    return job
  }

  async createAndEnqueue(
    tenantId: string,
    type: AiJobType,
    payload: Record<string, unknown> = {},
  ): Promise<AiJobEntity> {
    const job = await this.jobRepo.save(
      this.jobRepo.create({
        tenantId,
        type,
        status: AiJobStatus.QUEUED,
        payload,
      }),
    )

    const bullJob = await this.aiQueue.add(
      type,
      { jobId: job.id, tenantId, payload },
      { jobId: job.id },
    )

    job.bullJobId = String(bullJob.id)
    return this.jobRepo.save(job)
  }

  async enqueueEmbeddingReindex(tenantId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.EMBEDDING_REINDEX, {})
  }

  async markRunning(jobId: string): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: AiJobStatus.RUNNING,
      startedAt: new Date(),
      error: null,
    })
  }

  async markCompleted(
    jobId: string,
    result: Record<string, unknown>,
    totalTokens = 0,
  ): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: AiJobStatus.COMPLETED,
      result,
      totalTokens,
      completedAt: new Date(),
      error: null,
    })
  }

  async markFailed(jobId: string, error: string): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: AiJobStatus.FAILED,
      error: error.slice(0, 4000),
      completedAt: new Date(),
    })
  }
}
