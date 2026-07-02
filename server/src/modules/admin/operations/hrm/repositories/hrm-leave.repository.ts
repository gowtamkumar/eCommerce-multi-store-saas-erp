import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { LeaveQuotaEntity, LeaveRequestEntity } from '../entities/leave.entity'
import type { PaginatedResult } from '../hrm.repository'

const DEFAULT_LIMIT = 20

@Injectable()
export class HrmLeaveRepository extends BaseStoreRepository<LeaveRequestEntity> {
  constructor(
    @InjectRepository(LeaveRequestEntity)
    public readonly leaveRequestRepo: Repository<LeaveRequestEntity>,
    @InjectRepository(LeaveQuotaEntity)
    public readonly leaveQuotaRepo: Repository<LeaveQuotaEntity>,
  ) {
    super(LeaveRequestEntity, leaveRequestRepo)
  }

  async createLeaveRequest(data: Partial<LeaveRequestEntity>): Promise<LeaveRequestEntity> {
    return this.leaveRequestRepo.save(this.leaveRequestRepo.create(data))
  }

  async updateLeaveRequest(id: string, data: Partial<LeaveRequestEntity>): Promise<void> {
    await this.leaveRequestRepo.update(id, data)
  }

  async findLeaveRequestById(id: string, storeId: string): Promise<LeaveRequestEntity | null> {
    return this.leaveRequestRepo.findOne({ where: { id, storeId } })
  }

  async findAllLeaveRequests(
    storeId: string,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      status?: string
      from?: Date
      to?: Date
    },
  ): Promise<PaginatedResult<LeaveRequestEntity>> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? DEFAULT_LIMIT

    const qb = this.leaveRequestRepo
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'eu')
      .leftJoinAndSelect('employee.department', 'ed')
      .leftJoinAndSelect('lr.approvedBy', 'approvedBy')
      .leftJoinAndSelect('approvedBy.user', 'au')
      .where('lr.storeId = :storeId', { storeId })

    if (options?.employeeId)
      qb.andWhere('lr.employeeId = :employeeId', { employeeId: options.employeeId })
    if (options?.status) qb.andWhere('lr.status = :status', { status: options.status })
    if (options?.from) qb.andWhere('lr.endDate >= :from', { from: options.from })
    if (options?.to) qb.andWhere('lr.startDate <= :to', { to: options.to })

    qb.orderBy('lr.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async findOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    storeId: string,
    excludeId?: string,
  ): Promise<LeaveRequestEntity[]> {
    const qb = this.leaveRequestRepo
      .createQueryBuilder('lr')
      .where('lr.employeeId = :employeeId', { employeeId })
      .andWhere('lr.storeId = :storeId', { storeId })
      .andWhere('lr.status IN (:...statuses)', { statuses: ['PENDING', 'APPROVED'] })
      .andWhere('lr.startDate <= :endDate', { endDate })
      .andWhere('lr.endDate >= :startDate', { startDate })
    if (excludeId) qb.andWhere('lr.id != :excludeId', { excludeId })
    return qb.getMany()
  }

  async findLeaveQuota(
    employeeId: string,
    year: number,
    storeId: string,
  ): Promise<LeaveQuotaEntity[]> {
    return this.leaveQuotaRepo.find({ where: { employeeId, year, storeId } })
  }

  async countLeaveRequests(where: FindOptionsWhere<LeaveRequestEntity>): Promise<number> {
    return this.leaveRequestRepo.count({ where })
  }
}
