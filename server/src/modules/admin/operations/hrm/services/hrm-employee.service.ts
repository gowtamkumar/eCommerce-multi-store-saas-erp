import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  CreateEmployeeDto,
  CreateHolidayDto,
  CreateTaxBracketDto,
  UpdateEmployeeDto,
  UpdateHolidayDto,
} from '../dto/hrm.dto'
import { EmployeeEntity } from '../entities/employee.entity'
import { LeaveQuotaEntity } from '../entities/leave.entity'
import { LeaveType } from '@/common/enums/hrm/hrm-enums'
import { assertProductionSafe } from '../hrm.helpers'
import { HrmRepository } from '../hrm.repository'

@Injectable()
export class HrmEmployeeService {
  private readonly logger = new Logger(HrmEmployeeService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getDashboardStats(ctx: RequestContextDto) {
    return this.hrmRepo.getStats(ctx.storeId, ctx.branchId)
  }

  /** Ensure an employee record belongs to the current store. */
  async validateEmployeeInStore(
    employeeId: string,
    storeId: string,
  ): Promise<EmployeeEntity> {
    const employee = await this.hrmRepo.findEmployeeById(employeeId, storeId)
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found in this store`)
    return employee
  }

  // --- Employee CRUD ---
  async createEmployee(data: CreateEmployeeDto, ctx: RequestContextDto) {
    this.logger.log(`Creating employee profile for user ${data.userId} in store ${ctx.storeId}`)

    if (data.managerId) {
      await this.validateEmployeeInStore(data.managerId, ctx.storeId)
    }

    const { personalDetails, documents, ...employeeData } = data
    const humanReadableId = await this.hrmRepo.nextEmployeeId(ctx.storeId)

    const employee = await this.hrmRepo.createEmployee({
      ...employeeData,
      employeeId: humanReadableId,
      storeId: ctx.storeId,
      branchId: employeeData.branchId || ctx.branchId || null,
      joiningDate: new Date(data.joiningDate),
    })

    if (personalDetails) {
      await this.hrmRepo.personalDetailsRepo.save({
        ...personalDetails,
        employeeId: employee.id,
        storeId: ctx.storeId,
        dob: personalDetails.dob ? new Date(personalDetails.dob) : null,
      })
    }

    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await this.hrmRepo.documentRepo.save({
          ...doc,
          employeeId: employee.id,
          storeId: ctx.storeId,
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
        })
      }
    }

    const currentYear = new Date(data.joiningDate).getFullYear()
    await this.initializeDefaultLeaveQuotas(employee.id, ctx.storeId, currentYear)

    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Employee',
      entityId: employee.id,
      newValue: employee,
    })
    return this.findOneEmployee(employee.id, ctx)
  }

  async findAllEmployees(
    ctx: RequestContextDto,
    options?: {
      page?: number
      limit?: number
      departmentId?: string
      status?: string
      q?: string
    },
  ) {
    return this.hrmRepo.findAllEmployees(ctx.storeId, ctx.branchId, options)
  }

  async findOneEmployee(id: string, ctx: RequestContextDto) {
    const employee = await this.hrmRepo.findEmployeeById(id, ctx.storeId)
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto, ctx: RequestContextDto) {
    this.logger.log(`Updating employee ${id} for store ${ctx.storeId}`)
    const oldEmployee = await this.findOneEmployee(id, ctx)

    const { personalDetails, documents, ...updateData } = data
    const formattedUpdate: any = { ...updateData }
    if (data.exitDate) formattedUpdate.exitDate = new Date(data.exitDate)

    if (data.managerId) {
      await this.validateEmployeeInStore(data.managerId, ctx.storeId)
    }

    await this.hrmRepo.updateEmployee(id, formattedUpdate)

    if (personalDetails) {
      const pd = await this.hrmRepo.personalDetailsRepo.findOne({
        where: { employeeId: id },
      })
      const pdData = {
        ...personalDetails,
        dob: personalDetails.dob ? new Date(personalDetails.dob) : undefined,
      }

      if (pd) {
        await this.hrmRepo.personalDetailsRepo.update(pd.id, pdData)
      } else {
        await this.hrmRepo.personalDetailsRepo.save({
          ...pdData,
          employeeId: id,
          storeId: ctx.storeId,
        })
      }
    }

    if (documents !== undefined) {
      await this.syncEmployeeDocuments(id, documents, ctx.storeId)
    }

    const newEmployee = await this.findOneEmployee(id, ctx)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE',
      entity: 'Employee',
      entityId: id,
      oldValue: oldEmployee,
      newValue: newEmployee,
    })
    return newEmployee
  }

  // --- Employee Document Management ---
  async getEmployeeDocuments(employeeId: string, ctx: RequestContextDto) {
    await this.findOneEmployee(employeeId, ctx)
    return this.hrmRepo.documentRepo.find({
      where: { employeeId, storeId: ctx.storeId },
      order: { createdAt: 'DESC' },
    })
  }

  async addEmployeeDocument(
    employeeId: string,
    data: { documentType: string; fileUrl: string; expiryDate?: string },
    ctx: RequestContextDto,
  ) {
    await this.findOneEmployee(employeeId, ctx)

    const doc = this.hrmRepo.documentRepo.create({
      employeeId,
      storeId: ctx.storeId,
      documentType: data.documentType,
      fileUrl: data.fileUrl,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    })
    const saved = await this.hrmRepo.documentRepo.save(doc)

    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'EmployeeDocument',
      entityId: saved.id,
      newValue: saved,
    })

    return saved
  }

  async deleteEmployeeDocument(docId: string, ctx: RequestContextDto) {
    const doc = await this.hrmRepo.documentRepo.findOne({
      where: { id: docId, storeId: ctx.storeId },
    })
    if (!doc) throw new NotFoundException('Document not found')
    await this.hrmRepo.documentRepo.softDelete(docId)

    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'EmployeeDocument',
      entityId: docId,
      oldValue: doc,
    })
  }

  // --- Holiday Management ---
  async createHoliday(data: CreateHolidayDto, ctx: RequestContextDto) {
    const holiday = await this.hrmRepo.holidayRepo.save(
      this.hrmRepo.holidayRepo.create({
        ...data,
        date: new Date(data.date),
        storeId: ctx.storeId,
        branchId: data.branchId ?? null,
      }),
    )
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Holiday',
      entityId: holiday.id,
      newValue: holiday,
    })
    return holiday
  }

  async findAllHolidays(ctx: RequestContextDto, year?: number) {
    const qb = this.hrmRepo.holidayRepo
      .createQueryBuilder('h')
      .where('h.storeId = :storeId', { storeId: ctx.storeId })
      .orderBy('h.date', 'ASC')
    if (year) qb.andWhere('h.year = :year', { year })
    return qb.getMany()
  }

  async updateHoliday(id: string, data: UpdateHolidayDto, ctx: RequestContextDto) {
    const holiday = await this.hrmRepo.holidayRepo.findOne({
      where: { id, storeId: ctx.storeId },
    })
    if (!holiday) throw new NotFoundException('Holiday not found')
    const update: Record<string, unknown> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.isOptional !== undefined) update.isOptional = data.isOptional
    if (data.description !== undefined) update.description = data.description
    if (data.branchId !== undefined) update.branchId = data.branchId
    if (data.date) update.date = new Date(data.date)
    await this.hrmRepo.holidayRepo.update(id, update)
    return this.hrmRepo.holidayRepo.findOne({ where: { id, storeId: ctx.storeId } })
  }

  async deleteHoliday(id: string, ctx: RequestContextDto) {
    const holiday = await this.hrmRepo.holidayRepo.findOne({
      where: { id, storeId: ctx.storeId },
    })
    if (!holiday) throw new NotFoundException('Holiday not found')
    await this.hrmRepo.holidayRepo.softDelete(id)
    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'Holiday',
      entityId: id,
      oldValue: holiday,
    })
    return { id }
  }

  // --- Tax Bracket Management ---
  async createTaxBracket(data: CreateTaxBracketDto, ctx: RequestContextDto) {
    const bracket = await this.hrmRepo.taxBracketRepo.save(
      this.hrmRepo.taxBracketRepo.create({ ...data, storeId: ctx.storeId }),
    )
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'TaxBracket',
      entityId: bracket.id,
      newValue: bracket,
    })
    return bracket
  }

  async findAllTaxBrackets(ctx: RequestContextDto, fiscalYear?: number) {
    const qb = this.hrmRepo.taxBracketRepo
      .createQueryBuilder('tb')
      .where('tb.storeId = :storeId', { storeId: ctx.storeId })
      .orderBy('tb.fiscalYear', 'DESC')
      .addOrderBy('tb.sortOrder', 'ASC')
      .addOrderBy('tb.minAmount', 'ASC')
    if (fiscalYear) qb.andWhere('tb.fiscalYear = :fiscalYear', { fiscalYear })
    return qb.getMany()
  }

  async deleteTaxBracket(id: string, ctx: RequestContextDto) {
    const bracket = await this.hrmRepo.taxBracketRepo.findOne({
      where: { id, storeId: ctx.storeId },
    })
    if (!bracket) throw new NotFoundException('Tax bracket not found')
    await this.hrmRepo.taxBracketRepo.softDelete(id)
    return { id }
  }

  async seedDemoData(ctx: RequestContextDto) {
    assertProductionSafe('Demo data seeding')
    this.logger.log(`Seeding demo HRM data for store ${ctx.storeId}`)

    // 1. Departments & Designations
    const itDept = await this.hrmRepo.createDepartment({
      name: 'IT & Engineering',
      storeId: ctx.storeId,
    })
    const salesDept = await this.hrmRepo.createDepartment({
      name: 'Sales & Marketing',
      storeId: ctx.storeId,
    })

    const devDes = await this.hrmRepo.createDesignation({
      name: 'Senior Developer',
      departmentId: itDept.id,
      storeId: ctx.storeId,
    })
    const mgrDes = await this.hrmRepo.createDesignation({
      name: 'Sales Manager',
      departmentId: salesDept.id,
      storeId: ctx.storeId,
    })

    // 2. Shifts
    const dayShift = await this.hrmRepo.createShift({
      name: 'Standard Day Shift',
      startTime: '09:00:00',
      endTime: '18:00:00',
      graceMinutes: 15,
      storeId: ctx.storeId,
    })

    const nightShift = await this.hrmRepo.createShift({
      name: 'Security Night Shift',
      startTime: '22:00:00',
      endTime: '06:00:00',
      isNightShift: true,
      graceMinutes: 30,
      storeId: ctx.storeId,
    })

    // 3. Find some existing entities to link
    const employeesResult = await this.hrmRepo.findEmployeesAll(ctx.storeId)
    if (employeesResult.length === 0)
      return { message: 'Please create at least one employee first to link demo data.' }

    const emp = employeesResult[0]

    // 4. Assignments
    await this.hrmRepo.assignShift({
      employeeId: emp.id,
      shiftId: dayShift.id,
      effectiveFrom: new Date('2026-01-01'),
      storeId: ctx.storeId,
    })

    // 5. Attendance Logs (Last 5 days)
    for (let i = 1; i <= 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const checkIn = new Date(date)
      checkIn.setHours(9, Math.floor(Math.random() * 20), 0) // Randomly late or on time

      const checkOut = new Date(date)
      checkOut.setHours(18, Math.floor(Math.random() * 30), 0)

      const diffMs = checkOut.getTime() - checkIn.getTime()
      const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))

      await this.hrmRepo.saveAttendanceSession({
        employeeId: emp.id,
        checkIn,
        checkOut,
        workHours,
        lateMinutes: checkIn.getMinutes() > 15 ? checkIn.getMinutes() - 15 : 0,
        storeId: ctx.storeId,
      })
    }

    // 6. Leave Request
    await this.hrmRepo.createLeaveRequest({
      employeeId: emp.id,
      leaveType: 'ANNUAL' as any,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-05'),
      totalDays: 5,
      reason: 'Summer Vacation with family',
      status: 'PENDING' as any,
      storeId: ctx.storeId,
    })

    return { success: true, message: 'Demo data seeded successfully' }
  }

  /**
   * Diff-based document sync: only creates, updates, or deletes documents
   * that actually changed — never wipes the entire collection.
   */
  private async syncEmployeeDocuments(
    employeeId: string,
    incoming: { id?: string; documentType: string; fileUrl: string; expiryDate?: string }[],
    storeId: string,
  ) {
    const existing = await this.hrmRepo.documentRepo.find({ where: { employeeId, storeId } })
    const incomingIds = new Set(incoming.filter((d) => d.id).map((d) => d.id!))

    for (const doc of existing) {
      if (!incomingIds.has(doc.id)) {
        await this.hrmRepo.documentRepo.softDelete(doc.id)
      }
    }

    for (const doc of incoming) {
      const payload = {
        documentType: doc.documentType,
        fileUrl: doc.fileUrl,
        expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
      }
      if (doc.id) {
        await this.hrmRepo.documentRepo.update(doc.id, payload)
      } else {
        await this.hrmRepo.documentRepo.save({
          ...payload,
          employeeId,
          storeId,
        })
      }
    }
  }

  async initializeDefaultLeaveQuotas(
    employeeId: string,
    storeId: string,
    year: number,
  ) {
    const existing = await this.hrmRepo.leaveQuotaRepo.find({ where: { employeeId, storeId, year } })
    if (existing.length > 0) return

    const defaults = [
      { leaveType: LeaveType.SICK, totalDays: 10 },
      { leaveType: LeaveType.CASUAL, totalDays: 10 },
      { leaveType: LeaveType.ANNUAL, totalDays: 15 },
      { leaveType: LeaveType.MATERNITY, totalDays: 90 },
      { leaveType: LeaveType.PATERNITY, totalDays: 10 },
    ]

    for (const d of defaults) {
      await this.hrmRepo.leaveQuotaRepo.save(
        this.hrmRepo.leaveQuotaRepo.create({
          employeeId,
          storeId,
          leaveType: d.leaveType,
          totalDays: d.totalDays,
          usedDays: 0,
          year,
        }),
      )
    }
  }
}
