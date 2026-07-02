import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PerformanceReviewEntity } from '../entities/performance.entity'

@Injectable()
export class HrmPerformanceRepository extends BaseStoreRepository<PerformanceReviewEntity> {
  constructor(
    @InjectRepository(PerformanceReviewEntity)
    private readonly performanceReviewRepo: Repository<PerformanceReviewEntity>,
  ) {
    super(PerformanceReviewEntity, performanceReviewRepo)
  }

  async createPerformanceReview(
    data: Partial<PerformanceReviewEntity>,
  ): Promise<PerformanceReviewEntity> {
    return this.performanceReviewRepo.save(this.performanceReviewRepo.create(data))
  }

  async findAllPerformanceReviews(storeId: string): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { storeId },
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
    storeId: string,
  ): Promise<PerformanceReviewEntity[]> {
    return this.performanceReviewRepo.find({
      where: { employeeId, storeId },
      relations: {
        reviewer: {
          user: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }
}
