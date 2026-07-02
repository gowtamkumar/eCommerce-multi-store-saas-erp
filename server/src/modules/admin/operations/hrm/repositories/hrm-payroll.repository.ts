import { BaseStoreRepository } from '@/common/base-repository'
import { PayrollBatchStatus } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { PayrollBatchEntity, PayrollSlipEntity } from '../entities/payroll.entity'

@Injectable()
export class HrmPayrollRepository extends BaseStoreRepository<PayrollBatchEntity> {
  constructor(
    @InjectRepository(PayrollBatchEntity)
    public readonly payrollBatchRepo: Repository<PayrollBatchEntity>,
    @InjectRepository(PayrollSlipEntity)
    private readonly payrollSlipRepo: Repository<PayrollSlipEntity>,
  ) {
    super(PayrollBatchEntity, payrollBatchRepo)
  }

  async findActivePayrollBatchForPeriod(
    storeId: string,
    period: string,
  ): Promise<PayrollBatchEntity | null> {
    return this.payrollBatchRepo.findOne({
      where: {
        storeId,
        period,
        status: Not(PayrollBatchStatus.CANCELLED),
      },
    })
  }

  async findAllPayrollBatches(storeId: string): Promise<PayrollBatchEntity[]> {
    return this.payrollBatchRepo.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    })
  }

  async findPayrollBatchById(id: string, storeId: string): Promise<PayrollBatchEntity | null> {
    return this.payrollBatchRepo.findOne({ where: { id, storeId } })
  }

  async updatePayrollBatch(id: string, data: Partial<PayrollBatchEntity>): Promise<void> {
    await this.payrollBatchRepo.update(id, data)
  }

  async findPayrollSlipsByBatch(batchId: string, storeId: string): Promise<PayrollSlipEntity[]> {
    return this.payrollSlipRepo.find({
      where: { batchId, storeId },
      relations: {
        employee: {
          user: true,
          department: true,
          designation: true,
        },
      },
    })
  }
}
