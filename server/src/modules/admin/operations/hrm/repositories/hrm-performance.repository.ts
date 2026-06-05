import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PerformanceReviewEntity } from '../entities/performance.entity'

@Injectable()
export class HrmPerformanceRepository {
  constructor(
    @InjectRepository(PerformanceReviewEntity)
    private readonly performanceReviewRepo: Repository<PerformanceReviewEntity>,
  ) {}

  async createPerformanceReview(
    data: Partial<PerformanceReviewEntity>,
  ): Promise<PerformanceReviewEntity> {
    return this.performanceReviewRepo.save(this.performanceReviewRepo.create(data))
  }

  async findAllPerformanceReviews(tenantId: string): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { tenantId },
      relations: {
        employee: {
          user: true,
          department: true,
        },
        reviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findEmployeeReviews(
    employeeId: string,
    tenantId: string,
  ): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { employeeId, tenantId },
      relations: {
        reviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }
}
