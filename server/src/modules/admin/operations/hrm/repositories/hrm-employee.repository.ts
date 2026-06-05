import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, LessThanOrEqual, Repository } from 'typeorm'
import { EmployeeDocumentEntity } from '../entities/employee-document.entity'
import { EmployeeIdSequenceEntity } from '../entities/employee-id-sequence.entity'
import { EmployeePersonalDetailsEntity } from '../entities/employee-personal-details.entity'
import { EmployeeEntity } from '../entities/employee.entity'
import { HolidayEntity } from '../entities/holiday.entity'
import { TaxBracketEntity } from '../entities/tax-bracket.entity'
import type { PaginatedResult } from '../hrm.repository'

const DEFAULT_LIMIT = 20

@Injectable()
export class HrmEmployeeRepository {
  constructor(
    @InjectRepository(EmployeeEntity)
    public readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(EmployeePersonalDetailsEntity)
    public readonly personalDetailsRepo: Repository<EmployeePersonalDetailsEntity>,
    @InjectRepository(EmployeeDocumentEntity)
    public readonly documentRepo: Repository<EmployeeDocumentEntity>,
    @InjectRepository(HolidayEntity)
    public readonly holidayRepo: Repository<HolidayEntity>,
    @InjectRepository(TaxBracketEntity)
    public readonly taxBracketRepo: Repository<TaxBracketEntity>,
    @InjectRepository(EmployeeIdSequenceEntity)
    public readonly employeeIdSeqRepo: Repository<EmployeeIdSequenceEntity>,
  ) {}

  // --- Employee ---
  async createEmployee(data: Partial<EmployeeEntity>): Promise<EmployeeEntity> {
    return this.employeeRepo.save(this.employeeRepo.create(data))
  }

  async findAllEmployees(
    tenantId: string,
    branchId?: string,
    options?: {
      page?: number
      limit?: number
      departmentId?: string
      status?: string
      q?: string
    },
  ): Promise<PaginatedResult<EmployeeEntity>> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? DEFAULT_LIMIT
    const where: FindOptionsWhere<EmployeeEntity> = { tenantId }
    if (branchId) where.branchId = branchId
    if (options?.departmentId) where.departmentId = options.departmentId
    if (options?.status) where.status = options.status as any

    const qb = this.employeeRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'user')
      .leftJoinAndSelect('e.department', 'department')
      .leftJoinAndSelect('e.designation', 'designation')
      .leftJoinAndSelect('e.branch', 'branch')
      .leftJoinAndSelect('e.manager', 'manager')
      .leftJoinAndSelect('e.personalDetails', 'personalDetails')
      .where('e.tenantId = :tenantId', { tenantId })

    if (branchId) qb.andWhere('e.branchId = :branchId', { branchId })
    if (options?.departmentId)
      qb.andWhere('e.departmentId = :departmentId', { departmentId: options.departmentId })
    if (options?.status) qb.andWhere('e.status = :status', { status: options.status })
    if (options?.q) {
      qb.andWhere('(user.name ILIKE :q OR user.username ILIKE :q OR e.employeeId ILIKE :q)', {
        q: `%${options.q}%`,
      })
    }

    qb.orderBy('e.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async findEmployeesAll(tenantId: string, branchId?: string): Promise<EmployeeEntity[]> {
    const where: FindOptionsWhere<EmployeeEntity> = { tenantId }
    if (branchId) where.branchId = branchId
    return this.employeeRepo.find({
      where,
      relations: {
        user: true,
        department: true,
        designation: true,
        branch: true,
        manager: true,
        personalDetails: true,
      },
    })
  }

  async findEmployeeById(id: string, tenantId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepo.findOne({
      where: { id, tenantId },
      relations: {
        user: true,
        department: true,
        designation: true,
        branch: true,
        manager: true,
        personalDetails: true,
        documents: true,
      },
    })
  }

  async updateEmployee(id: string, data: Partial<EmployeeEntity>): Promise<void> {
    await this.employeeRepo.update(id, data)
  }

  async countEmployees(where: FindOptionsWhere<EmployeeEntity>): Promise<number> {
    return this.employeeRepo.count({ where })
  }

  // --- Holidays ---
  async findHolidaysInRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<HolidayEntity[]> {
    const qb = this.holidayRepo
      .createQueryBuilder('h')
      .where('h.tenantId = :tenantId', { tenantId })
      .andWhere('h.date >= :startDate', { startDate })
      .andWhere('h.date <= :endDate', { endDate })

    if (branchId) {
      qb.andWhere('(h.branchId IS NULL OR h.branchId = :branchId)', { branchId })
    }
    return qb.getMany()
  }

  async findHolidaysExpiringSoon(referenceDate: Date): Promise<EmployeeDocumentEntity[]> {
    return this.documentRepo.find({
      where: {
        expiryDate: LessThanOrEqual(referenceDate),
      } as any,
    })
  }

  async findExpiringDocuments(daysAhead: number): Promise<EmployeeDocumentEntity[]> {
    const now = new Date()
    const ahead = new Date()
    ahead.setDate(ahead.getDate() + daysAhead)

    return this.documentRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .where('d.expiryDate IS NOT NULL')
      .andWhere('d.expiryDate >= :now', { now })
      .andWhere('d.expiryDate <= :ahead', { ahead })
      .getMany()
  }

  // --- Probation auto-confirmation ---
  async findEmployeesEligibleForProbationCompletion(
    referenceDate: Date,
    probationDays: number,
  ): Promise<EmployeeEntity[]> {
    const cutoff = new Date(referenceDate)
    cutoff.setDate(cutoff.getDate() - probationDays)

    return this.employeeRepo.find({
      where: {
        status: 'PROBATION' as any,
        joiningDate: LessThanOrEqual(cutoff) as any,
      },
      relations: {
        user: true,
      },
    })
  }

  // --- Employee ID sequence ---
  /**
   * Atomically increments the per-tenant employee-id counter and returns the
   * generated code. Uses a single UPDATE with RETURNING so concurrent calls
   * cannot mint duplicates.
   */
  async nextEmployeeId(tenantId: string): Promise<string> {
    let seq = await this.employeeIdSeqRepo.findOne({ where: { tenantId } })
    if (!seq) {
      seq = this.employeeIdSeqRepo.create({ tenantId })
      try {
        await this.employeeIdSeqRepo.save(seq)
      } catch {
        // race: another caller created it concurrently
        seq = await this.employeeIdSeqRepo.findOne({ where: { tenantId } })
      }
    }

    const result = await this.employeeIdSeqRepo
      .createQueryBuilder()
      .update(EmployeeIdSequenceEntity)
      .set({ lastValue: () => '"last_value" + 1' })
      .where('tenant_id = :tenantId', { tenantId })
      .returning(['lastValue', 'prefix', 'padLength'])
      .execute()

    const row = (result.raw && result.raw[0]) || {}
    const lastValue = Number(row.last_value ?? row.lastValue ?? seq?.lastValue ?? 1)
    const prefix = row.prefix ?? seq?.prefix ?? 'EMP-'
    const padLength = Number(row.pad_length ?? row.padLength ?? seq?.padLength ?? 6)
    return `${prefix}${String(lastValue).padStart(padLength, '0')}`
  }
}
