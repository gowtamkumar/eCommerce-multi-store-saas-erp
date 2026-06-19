import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, FindOptionsWhere, In, Repository } from 'typeorm'
import { AttendanceEventEntity } from '../entities/attendance-event.entity'
import { AttendanceSessionEntity } from '../entities/attendance.entity'
import { EmployeeShiftAssignmentEntity, ShiftEntity } from '../entities/shift.entity'
import type { PaginatedResult } from '../hrm.repository'

const DEFAULT_LIMIT = 20

@Injectable()
export class HrmAttendanceRepository extends BaseTenantRepository<ShiftEntity> {
  constructor(
    @InjectRepository(ShiftEntity)
    private readonly shiftRepo: Repository<ShiftEntity>,
    @InjectRepository(EmployeeShiftAssignmentEntity)
    private readonly shiftAssignmentRepo: Repository<EmployeeShiftAssignmentEntity>,
    @InjectRepository(AttendanceEventEntity)
    private readonly attendanceEventRepo: Repository<AttendanceEventEntity>,
    @InjectRepository(AttendanceSessionEntity)
    public readonly attendanceSessionRepo: Repository<AttendanceSessionEntity>,
  ) {
    super(ShiftEntity, shiftRepo)
  }

  // --- Shifts ---
  async createShift(data: Partial<ShiftEntity>): Promise<ShiftEntity> {
    return this.shiftRepo.save(this.shiftRepo.create(data))
  }

  async findAllShifts(tenantId: string): Promise<ShiftEntity[]> {
    return this.shiftRepo.find({ where: { tenantId } })
  }

  async findShiftById(id: string, tenantId: string): Promise<ShiftEntity | null> {
    return this.shiftRepo.findOne({ where: { id, tenantId } })
  }

  async updateShift(id: string, data: Partial<ShiftEntity>): Promise<void> {
    await this.shiftRepo.update(id, data)
  }

  async deleteShift(id: string): Promise<void> {
    await this.shiftRepo.softDelete(id)
  }

  async assignShift(
    data: Partial<EmployeeShiftAssignmentEntity>,
  ): Promise<EmployeeShiftAssignmentEntity> {
    return this.shiftAssignmentRepo.save(this.shiftAssignmentRepo.create(data))
  }

  async findEmployeeShiftAssignments(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity[]> {
    return this.shiftAssignmentRepo.find({
      where: { employeeId, tenantId },
      relations: {
        shift: true,
      },
      order: { effectiveFrom: 'DESC' },
    })
  }

  /**
   * Find the active shift assignment whose date range contains `date`.
   * Honours both `effectiveFrom` and `effectiveTo`.
   */
  async findEmployeeShift(
    employeeId: string,
    date: Date,
    tenantId: string,
  ): Promise<EmployeeShiftAssignmentEntity | null> {
    const qb = this.shiftAssignmentRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.shift', 'shift')
      .where('a.employeeId = :employeeId', { employeeId })
      .andWhere('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.effectiveFrom <= :date', { date })
      .andWhere('(a.effectiveTo IS NULL OR a.effectiveTo >= :date)', { date })
      .orderBy('a.effectiveFrom', 'DESC')
      .limit(1)
    return qb.getOne()
  }

  // --- Attendance ---
  async logAttendanceEvent(data: Partial<AttendanceEventEntity>): Promise<AttendanceEventEntity> {
    return this.attendanceEventRepo.save(this.attendanceEventRepo.create(data))
  }

  async saveAttendanceSession(
    data: Partial<AttendanceSessionEntity>,
  ): Promise<AttendanceSessionEntity> {
    return this.attendanceSessionRepo.save(this.attendanceSessionRepo.create(data))
  }

  async findLatestAttendanceSession(
    employeeId: string,
    tenantId: string,
  ): Promise<AttendanceSessionEntity | null> {
    return this.attendanceSessionRepo.findOne({
      where: { employeeId, tenantId },
      order: { checkIn: 'DESC' },
    })
  }

  async findAllAttendanceSessions(
    tenantId: string,
    branchId?: string,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      from?: Date
      to?: Date
    },
  ): Promise<PaginatedResult<AttendanceSessionEntity>> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? DEFAULT_LIMIT

    const qb = this.attendanceSessionRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .where('s.tenantId = :tenantId', { tenantId })

    if (branchId) qb.andWhere('s.branchId = :branchId', { branchId })
    if (options?.employeeId)
      qb.andWhere('s.employeeId = :employeeId', { employeeId: options.employeeId })
    if (options?.from) qb.andWhere('s.checkIn >= :from', { from: options.from })
    if (options?.to) qb.andWhere('s.checkIn <= :to', { to: options.to })

    qb.orderBy('s.checkIn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async findAttendanceSessionsForEmployee(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<AttendanceSessionEntity[]> {
    return this.attendanceSessionRepo.find({
      where: {
        employeeId,
        tenantId,
        checkIn: Between(startDate, endDate),
      },
      order: { checkIn: 'ASC' },
    })
  }

  async findAttendanceSessionsForEmployees(
    employeeIds: string[],
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<AttendanceSessionEntity[]> {
    if (employeeIds.length === 0) return []
    return this.attendanceSessionRepo.find({
      where: {
        employeeId: In(employeeIds),
        tenantId,
        checkIn: Between(startDate, endDate),
      },
      order: { checkIn: 'ASC' },
    })
  }

  async countAttendanceSessions(
    where: FindOptionsWhere<AttendanceSessionEntity>,
  ): Promise<number> {
    return this.attendanceSessionRepo.count({ where })
  }
}
