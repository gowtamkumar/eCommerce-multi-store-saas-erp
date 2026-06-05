import { PayrollBatchStatus } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { PayrollBatchEntity, PayrollSlipEntity } from '../entities/payroll.entity'

@Injectable()
export class HrmPayrollRepository {
  constructor(
    @InjectRepository(PayrollBatchEntity)
    public readonly payrollBatchRepo: Repository<PayrollBatchEntity>,
    @InjectRepository(PayrollSlipEntity)
    private readonly payrollSlipRepo: Repository<PayrollSlipEntity>,
  ) {}

  async findActivePayrollBatchForPeriod(
    tenantId: string,
    period: string,
  ): Promise<PayrollBatchEntity | null> {
    return this.payrollBatchRepo.findOne({
      where: {
        tenantId,
        period,
        status: Not(PayrollBatchStatus.CANCELLED),
      },
    })
  }

  async findAllPayrollBatches(tenantId: string): Promise<PayrollBatchEntity[]> {
    return this.payrollBatchRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findPayrollBatchById(id: string, tenantId: string): Promise<PayrollBatchEntity | null> {
    return this.payrollBatchRepo.findOne({ where: { id, tenantId } })
  }

  async updatePayrollBatch(id: string, data: Partial<PayrollBatchEntity>): Promise<void> {
    await this.payrollBatchRepo.update(id, data)
  }

  async findPayrollSlipsByBatch(batchId: string, tenantId: string): Promise<PayrollSlipEntity[]> {
    return this.payrollSlipRepo.find({
      where: { batchId, tenantId },
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
