import { RequestContextDto } from '@/common/dto/request-context.dto'
import {
  ApplicantStatus,
  AttendanceSource,
  EmployeeStatus,
  JobStatus,
  LeaveStatus,
  LeaveType,
  PayrollBatchStatus,
} from '@/common/enums/hrm/hrm-enums'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import * as crypto from 'crypto'
import { Between, In } from 'typeorm'
import {
  AssignShiftDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
  CreateHolidayDto,
  CreateShiftDto,
  CreateTaxBracketDto,
  UpdateDepartmentDto,
  UpdateDesignationDto,
  UpdateEmployeeDto,
  UpdateHolidayDto,
  UpdateShiftDto,
} from './dto/hrm.dto'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { EmployeeEntity } from './entities/employee.entity'
import { HolidayEntity } from './entities/holiday.entity'
import { LeaveRequestEntity } from './entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from './entities/payroll.entity'
import { EmployeeShiftAssignmentEntity } from './entities/shift.entity'
import { TaxBracketEntity } from './entities/tax-bracket.entity'
import { HrmRepository } from './hrm.repository'
import {
  assertProductionSafe,
  buildCheckInDateSet,
  buildHolidayDateSet,
  classifyPayrollDays,
  computeIncomeTax,
  computeLateMinutes,
  computeOvertimeHours,
  countCalendarDays,
  isIpAllowed,
  resolveWorkingDays,
  toDateString,
} from './hrm.helpers'

@Injectable()
export class HrmService {
  private readonly logger = new Logger(HrmService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    @InjectQueue('accounting') private readonly accountingQueue: Queue,
    private readonly auditLogService: AuditLogService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) { }

  async getDashboardStats(ctx: RequestContextDto) {
    return this.hrmRepo.getStats(ctx.tenantId, ctx.branchId)
  }

  /** Ensure an employee record belongs to the current tenant. */
  private async validateEmployeeInTenant(
    employeeId: string,
    tenantId: string,
  ): Promise<EmployeeEntity> {
    const employee = await this.hrmRepo.findEmployeeById(employeeId, tenantId)
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found in this tenant`)
    return employee
  }

  // --- Department CRUD ---
  async createDepartment(data: CreateDepartmentDto, ctx: RequestContextDto) {
    this.logger.log(`Creating department "${data.name}" for tenant ${ctx.tenantId}`)
    const res = await this.hrmRepo.createDepartment({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Department',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async findAllDepartments(ctx: RequestContextDto) {
    return this.hrmRepo.findAllDepartments(ctx.tenantId)
  }

  async updateDepartment(id: string, data: UpdateDepartmentDto, ctx: RequestContextDto) {
    this.logger.log(`Updating department ${id} for tenant ${ctx.tenantId}`)
    const old = await this.hrmRepo.findDepartmentById(id, ctx.tenantId)
    if (!old) throw new NotFoundException('Department not found')
    await this.hrmRepo.updateDepartment(id, data)
    const updated = await this.hrmRepo.findDepartmentById(id, ctx.tenantId)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE',
      entity: 'Department',
      entityId: id,
      oldValue: old,
      newValue: updated,
    })
    return updated
  }

  async deleteDepartment(id: string, ctx: RequestContextDto) {
    this.logger.log(`Deleting department ${id} for tenant ${ctx.tenantId}`)
    const dept = await this.hrmRepo.findDepartmentById(id, ctx.tenantId)
    if (!dept) throw new NotFoundException('Department not found')
    await this.hrmRepo.deleteDepartment(id)
    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'Department',
      entityId: id,
      oldValue: dept,
    })
    return { id }
  }

  // --- Designation CRUD ---
  async createDesignation(data: CreateDesignationDto, ctx: RequestContextDto) {
    this.logger.log(`Creating designation "${data.name}" for tenant ${ctx.tenantId}`)
    const res = await this.hrmRepo.createDesignation({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Designation',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async findAllDesignations(ctx: RequestContextDto) {
    return this.hrmRepo.findAllDesignations(ctx.tenantId)
  }

  async updateDesignation(id: string, data: UpdateDesignationDto, ctx: RequestContextDto) {
    this.logger.log(`Updating designation ${id} for tenant ${ctx.tenantId}`)
    const old = await this.hrmRepo.findDesignationById(id, ctx.tenantId)
    if (!old) throw new NotFoundException('Designation not found')
    await this.hrmRepo.updateDesignation(id, data)
    const updated = await this.hrmRepo.findDesignationById(id, ctx.tenantId)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE',
      entity: 'Designation',
      entityId: id,
      oldValue: old,
      newValue: updated,
    })
    return updated
  }

  async deleteDesignation(id: string, ctx: RequestContextDto) {
    this.logger.log(`Deleting designation ${id} for tenant ${ctx.tenantId}`)
    const des = await this.hrmRepo.findDesignationById(id, ctx.tenantId)
    if (!des) throw new NotFoundException('Designation not found')
    await this.hrmRepo.deleteDesignation(id)
    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'Designation',
      entityId: id,
      oldValue: des,
    })
    return { id }
  }

  // --- Employee CRUD ---
  async createEmployee(data: CreateEmployeeDto, ctx: RequestContextDto) {
    this.logger.log(`Creating employee profile for user ${data.userId} in tenant ${ctx.tenantId}`)

    if (data.managerId) {
      await this.validateEmployeeInTenant(data.managerId, ctx.tenantId)
    }

    const { personalDetails, documents, ...employeeData } = data
    const humanReadableId = await this.hrmRepo.nextEmployeeId(ctx.tenantId)

    const employee = await this.hrmRepo.createEmployee({
      ...employeeData,
      employeeId: humanReadableId,
      tenantId: ctx.tenantId,
      branchId: employeeData.branchId || ctx.branchId || null,
      joiningDate: new Date(data.joiningDate),
    })

    if (personalDetails) {
      await this.hrmRepo.personalDetailsRepo.save({
        ...personalDetails,
        employeeId: employee.id,
        tenantId: ctx.tenantId,
        dob: personalDetails.dob ? new Date(personalDetails.dob) : null,
      })
    }

    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await this.hrmRepo.documentRepo.save({
          ...doc,
          employeeId: employee.id,
          tenantId: ctx.tenantId,
          expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
        })
      }
    }

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
    return this.hrmRepo.findAllEmployees(ctx.tenantId, ctx.branchId, options)
  }

  async findOneEmployee(id: string, ctx: RequestContextDto) {
    const employee = await this.hrmRepo.findEmployeeById(id, ctx.tenantId)
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto, ctx: RequestContextDto) {
    this.logger.log(`Updating employee ${id} for tenant ${ctx.tenantId}`)
    const oldEmployee = await this.findOneEmployee(id, ctx)

    const { personalDetails, documents, ...updateData } = data
    const formattedUpdate: any = { ...updateData }
    if (data.exitDate) formattedUpdate.exitDate = new Date(data.exitDate)

    if (data.managerId) {
      await this.validateEmployeeInTenant(data.managerId, ctx.tenantId)
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
          tenantId: ctx.tenantId,
        })
      }
    }

    if (documents !== undefined) {
      await this.syncEmployeeDocuments(id, documents, ctx.tenantId)
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

  // --- Shift Management ---
  async createShift(data: CreateShiftDto, ctx: RequestContextDto) {
    this.logger.log(`Creating shift "${data.name}" for tenant ${ctx.tenantId}`)
    const res = await this.hrmRepo.createShift({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Shift',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async findAllShifts(ctx: RequestContextDto) {
    return this.hrmRepo.findAllShifts(ctx.tenantId)
  }

  async updateShift(id: string, data: UpdateShiftDto, ctx: RequestContextDto) {
    this.logger.log(`Updating shift ${id} for tenant ${ctx.tenantId}`)
    const old = await this.hrmRepo.findShiftById(id, ctx.tenantId)
    if (!old) throw new NotFoundException('Shift not found')
    await this.hrmRepo.updateShift(id, data)
    const updated = await this.hrmRepo.findShiftById(id, ctx.tenantId)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE',
      entity: 'Shift',
      entityId: id,
      oldValue: old,
      newValue: updated,
    })
    return updated
  }

  async deleteShift(id: string, ctx: RequestContextDto) {
    this.logger.log(`Deleting shift ${id} for tenant ${ctx.tenantId}`)
    const shift = await this.hrmRepo.findShiftById(id, ctx.tenantId)
    if (!shift) throw new NotFoundException('Shift not found')
    await this.hrmRepo.deleteShift(id)
    await this.auditLogService.log(ctx, {
      action: 'DELETE',
      entity: 'Shift',
      entityId: id,
      oldValue: shift,
    })
    return { id }
  }

  async assignShift(employeeId: string, data: AssignShiftDto, ctx: RequestContextDto) {
    this.logger.log(`Assigning shift ${data.shiftId} to employee ${employeeId}`)
    await this.validateEmployeeInTenant(employeeId, ctx.tenantId)
    const shift = await this.hrmRepo.findShiftById(data.shiftId, ctx.tenantId)
    if (!shift) throw new NotFoundException('Shift not found')

    const res = await this.hrmRepo.assignShift({
      ...data,
      employeeId,
      tenantId: ctx.tenantId,
      effectiveFrom: new Date(data.effectiveFrom),
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
    })
    await this.auditLogService.log(ctx, {
      action: 'ASSIGN',
      entity: 'EmployeeShift',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async findEmployeeShiftAssignments(employeeId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findEmployeeShiftAssignments(employeeId, ctx.tenantId)
  }

  // --- Attendance Logic ---
  async checkIn(
    employeeId: string,
    ipAddress: string,
    ctx: RequestContextDto,
    options?: {
      source?: AttendanceSource
      deviceId?: string
      gpsLat?: number
      gpsLong?: number
      photoUrl?: string
      timezoneOffset?: number
    },
  ) {
    const employee = await this.findOneEmployee(employeeId, ctx)

    const location = employee.branch
    if (location?.ipWhitelist && ipAddress) {
      if (!isIpAllowed(ipAddress, location.ipWhitelist)) {
        this.logger.warn(
          `Unauthorized check-in attempt from IP ${ipAddress} for employee ${employeeId}`,
        )
        throw new ForbiddenException(
          'Unauthorized location. Please connect to the company network.',
        )
      }
    }

    const latest = await this.hrmRepo.findLatestAttendanceSession(employeeId, ctx.tenantId)
    if (latest && !latest.checkOut) {
      throw new ConflictException('Employee is already checked in')
    }

    const now = new Date()
    const assignment = await this.hrmRepo.findEmployeeShift(employeeId, now, ctx.tenantId)
    const lateMinutes = computeLateMinutes(now, assignment, options?.timezoneOffset)

    await this.hrmRepo.logAttendanceEvent({
      employeeId,
      tenantId: ctx.tenantId,
      eventType: 'CHECK_IN',
      ipAddress,
      source: options?.source ?? AttendanceSource.WEB,
      deviceId: options?.deviceId,
      gpsLat: options?.gpsLat,
      gpsLong: options?.gpsLong,
      photoUrl: options?.photoUrl,
      timestamp: now,
    })

    return this.hrmRepo.saveAttendanceSession({
      employeeId,
      tenantId: ctx.tenantId,
      branchId: employee.branchId,
      checkIn: now,
      lateMinutes,
    })
  }

  async checkOut(
    employeeId: string,
    ctx: RequestContextDto,
    options?: { source?: AttendanceSource; deviceId?: string },
  ) {
    const latest = await this.hrmRepo.findLatestAttendanceSession(employeeId, ctx.tenantId)
    if (!latest || latest.checkOut) {
      throw new BadRequestException('No active check-in session found')
    }

    const checkOut = new Date()
    const assignment = await this.hrmRepo.findEmployeeShift(
      employeeId,
      latest.checkIn,
      ctx.tenantId,
    )
    const diffMs = checkOut.getTime() - new Date(latest.checkIn).getTime()
    const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
    const overtimeHours = computeOvertimeHours(new Date(latest.checkIn), checkOut, assignment)

    await this.hrmRepo.logAttendanceEvent({
      employeeId,
      tenantId: ctx.tenantId,
      eventType: 'CHECK_OUT',
      source: options?.source ?? AttendanceSource.WEB,
      deviceId: options?.deviceId,
      timestamp: checkOut,
    })

    await this.hrmRepo.saveAttendanceSession({
      ...latest,
      checkOut,
      workHours,
      overtimeHours,
    })

    return this.findOneEmployee(employeeId, ctx)
  }

  async findAllAttendanceSessions(
    ctx: RequestContextDto,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      from?: string
      to?: string
    },
  ) {
    return this.hrmRepo.findAllAttendanceSessions(ctx.tenantId, ctx.branchId, {
      ...options,
      from: options?.from ? new Date(options.from) : undefined,
      to: options?.to ? new Date(options.to) : undefined,
    })
  }

  // --- Leave Management ---
  async requestLeave(
    employeeId: string,
    data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string },
    ctx: RequestContextDto,
  ) {
    await this.validateEmployeeInTenant(employeeId, ctx.tenantId)

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    if (endDate < startDate) {
      throw new BadRequestException('End date must be on or after start date')
    }

    const totalDays = countCalendarDays(startDate, endDate)

    const overlapping = await this.hrmRepo.findOverlappingLeaves(
      employeeId,
      startDate,
      endDate,
      ctx.tenantId,
    )
    if (overlapping.length > 0) {
      throw new ConflictException(
        'This leave request overlaps with an existing pending or approved leave',
      )
    }

    const quotas = await this.hrmRepo.findLeaveQuota(
      employeeId,
      startDate.getFullYear(),
      ctx.tenantId,
    )
    const quota = quotas.find((q) => q.leaveType === data.leaveType)
    if (quota && quota.usedDays + totalDays > quota.totalDays) {
      throw new BadRequestException(`Insufficient leave balance for ${data.leaveType}`)
    }

    const res = await this.hrmRepo.createLeaveRequest({
      leaveType: data.leaveType,
      reason: data.reason,
      employeeId,
      tenantId: ctx.tenantId,
      startDate,
      endDate,
      totalDays,
    })

    try {
      const employee = await this.hrmRepo.findEmployeeById(employeeId, ctx.tenantId)
      const empName = employee?.user?.name || employee?.user?.username || 'An employee'
      await this.notificationService.createNotification(
        {
          title: 'New Leave Request Submitted',
          message: `${empName} has requested ${totalDays} day(s) of ${data.leaveType} leave starting ${startDate.toLocaleDateString()}.`,
          type: 'INFO',
          link: '/admin/hrm/leaves',
          userId: null,
        },
        ctx.tenantId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger leave request notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'LeaveRequest',
      entityId: res.id,
      newValue: res,
    })
    return res
  }

  async approveLeave(
    requestId: string,
    approvedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    await this.validateEmployeeInTenant(approvedById, ctx.tenantId)

    const request = await this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
    if (!request) throw new NotFoundException('Leave request not found')
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${request.status}`)
    }

    await this.hrmRepo.leaveRequestRepo.manager.transaction(async (em) => {
      await em.getRepository(LeaveRequestEntity).update(requestId, {
        status: LeaveStatus.APPROVED,
        approvedById,
        managerNote,
      })

      const year = new Date(request.startDate).getFullYear()
      const quotaResult = await em
        .createQueryBuilder()
        .update('leave_quotas')
        .set({ usedDays: () => `"used_days" + ${request.totalDays}` })
        .where('employee_id = :employeeId', { employeeId: request.employeeId })
        .andWhere('tenant_id = :tenantId', { tenantId: ctx.tenantId })
        .andWhere('leave_type = :leaveType', { leaveType: request.leaveType })
        .andWhere('year = :year', { year })
        .andWhere(`"used_days" + ${request.totalDays} <= "total_days"`)
        .execute()

      if (quotaResult.affected === 0) {
        const quota = await this.hrmRepo.findLeaveQuota(request.employeeId, year, ctx.tenantId)
        const match = quota.find((q) => q.leaveType === request.leaveType)
        if (match && match.usedDays + request.totalDays > match.totalDays) {
          throw new BadRequestException(`Insufficient leave balance for ${request.leaveType}`)
        }
      }
    })

    try {
      const employee = await this.hrmRepo.findEmployeeById(request.employeeId, ctx.tenantId)
      if (employee?.userId) {
        await this.notificationService.createNotification(
          {
            title: 'Leave Request Approved',
            message: `Your leave request for ${new Date(request.startDate).toLocaleDateString()} has been approved.`,
            type: 'SUCCESS',
            link: '/admin/profile',
            userId: employee.userId,
          },
          ctx.tenantId,
        )
      }
    } catch (e: any) {
      this.logger.error(`Failed to trigger leave approval notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'APPROVE',
      entity: 'LeaveRequest',
      entityId: requestId,
      newValue: { status: LeaveStatus.APPROVED },
    })

    return this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
  }

  async findAllLeaveRequests(
    ctx: RequestContextDto,
    options?: {
      page?: number
      limit?: number
      employeeId?: string
      status?: string
      from?: string
      to?: string
    },
  ) {
    return this.hrmRepo.findAllLeaveRequests(ctx.tenantId, {
      ...options,
      from: options?.from ? new Date(options.from) : undefined,
      to: options?.to ? new Date(options.to) : undefined,
    })
  }

  // --- Payroll Engine ---
  async processPayroll(period: string, name: string, ctx: RequestContextDto) {
    this.logger.log(`Starting payroll process for period ${period}`)

    const existing = await this.hrmRepo.findActivePayrollBatchForPeriod(ctx.tenantId, period)
    if (existing) {
      throw new BadRequestException(
        `Payroll for period ${period} has already been processed and is in ${existing.status} status.`,
      )
    }

    const [yearStr, monthStr] = period.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    if (!year || !month || month < 1 || month > 12) {
      throw new BadRequestException('Period must be in YYYY-MM format')
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)
    const totalDaysInMonth = new Date(year, month, 0).getDate()

    const holidays = await this.hrmRepo.findHolidaysInRange(ctx.tenantId, startDate, endDate)
    const holidayDateSet = buildHolidayDateSet(holidays)

    const taxBrackets = await this.hrmRepo.taxBracketRepo.find({
      where: { tenantId: ctx.tenantId, fiscalYear: year },
      order: { sortOrder: 'ASC', minAmount: 'ASC' },
    })

    return await this.hrmRepo.employeeRepo.manager.transaction(async (em) => {
      const employeeRepo = em.getRepository(EmployeeEntity)
      const leaveRequestRepo = em.getRepository(LeaveRequestEntity)
      const attendanceSessionRepo = em.getRepository(AttendanceSessionEntity)
      const payrollBatchRepo = em.getRepository(PayrollBatchEntity)

      const employees = await employeeRepo.find({
        where: { tenantId: ctx.tenantId },
        relations: ['user', 'department', 'designation', 'branch', 'manager', 'personalDetails'],
      })

      const activeEmployees = employees.filter(
        (e) => e.status === EmployeeStatus.ACTIVE || e.status === EmployeeStatus.PROBATION,
      )
      const employeeIds = activeEmployees.map((e) => e.id)

      const [approvedLeaves, allSessions] = await Promise.all([
        leaveRequestRepo.find({ where: { tenantId: ctx.tenantId, status: LeaveStatus.APPROVED } }),
        employeeIds.length > 0
          ? attendanceSessionRepo.find({
            where: {
              employeeId: In(employeeIds),
              tenantId: ctx.tenantId,
              checkIn: Between(startDate, endDate),
            },
            order: { checkIn: 'ASC' },
          })
          : Promise.resolve([]),
      ])

      const sessionsByEmployee = new Map<string, AttendanceSessionEntity[]>()
      for (const session of allSessions) {
        const list = sessionsByEmployee.get(session.employeeId) ?? []
        list.push(session)
        sessionsByEmployee.set(session.employeeId, list)
      }

      const batch = await payrollBatchRepo.save(
        payrollBatchRepo.create({
          name,
          period,
          tenantId: ctx.tenantId,
          status: PayrollBatchStatus.DRAFT,
        }),
      )

      let batchNetTotal = 0
      let totalGrossSalaries = 0
      let totalTaxesWithheld = 0
      let totalBaseDeductions = 0
      let totalLateDeductions = 0
      let totalUnpaidLeaveDeductions = 0
      let totalUnpaidAbsenceDeductions = 0
      let totalInactiveDeductions = 0
      const slips: PayrollSlipEntity[] = []

      for (const employee of activeEmployees) {
        const salary = Number(employee.salaryConfig?.basicSalary ?? 0)
        const allowances =
          employee.salaryConfig?.allowances?.reduce((sum, a) => sum + Number(a.amount), 0) ?? 0
        const baseDeductions =
          employee.salaryConfig?.deductions?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0

        const sessions = sessionsByEmployee.get(employee.id) ?? []
        const overtimeHours = sessions.reduce((sum, s) => sum + Number(s.overtimeHours ?? 0), 0)
        const lateMinutes = sessions.reduce((sum, s) => sum + Number(s.lateMinutes ?? 0), 0)

        const hourlyRate = salary / 160
        const overtimePay = parseFloat((overtimeHours * hourlyRate * 1.5).toFixed(2))
        const lateDeductions = parseFloat(
          (Math.floor(lateMinutes / 30) * (hourlyRate * 0.5)).toFixed(2),
        )

        const assignment = await this.hrmRepo.findEmployeeShift(
          employee.id,
          startDate,
          ctx.tenantId,
        )
        const workingDays = resolveWorkingDays(assignment)
        const employeeLeaves = approvedLeaves.filter((l) => l.employeeId === employee.id)
        const checkInDateSet = buildCheckInDateSet(sessions)

        const dayStats = classifyPayrollDays({
          year,
          month,
          totalDaysInMonth,
          joiningDateStr: toDateString(employee.joiningDate),
          exitDateStr: employee.exitDate ? toDateString(employee.exitDate) : null,
          workingDays,
          holidayDateSet,
          checkInDateSet,
          approvedLeaves: employeeLeaves,
        })

        const activeDays = dayStats.filter((d) => d.isActive).length
        const unpaidLeaveDays = dayStats.filter((d) => d.isUnpaidLeave).length
        const unpaidAbsenceDays = dayStats.filter((d) => d.isUnpaidAbsence).length
        const holidayDays = dayStats.filter((d) => d.isActive && d.isHoliday).length
        const weeklyOffDays = dayStats.filter((d) => d.isActive && d.isWeeklyOff).length
        const workingDayCount = dayStats.filter((d) => d.isWorkingDay).length
        const inactiveDays = totalDaysInMonth - activeDays
        const dailyRate = salary / totalDaysInMonth

        const unpaidLeaveDeductions = parseFloat((unpaidLeaveDays * dailyRate).toFixed(2))
        const unpaidAbsenceDeductions = parseFloat((unpaidAbsenceDays * dailyRate).toFixed(2))
        const inactiveDeductions = parseFloat((inactiveDays * dailyRate).toFixed(2))
        const totalUnpaidDeductions = parseFloat(
          (unpaidLeaveDeductions + unpaidAbsenceDeductions + inactiveDeductions).toFixed(2),
        )

        const grossSalary = salary + allowances + overtimePay
        const incomeTax = computeIncomeTax(grossSalary, taxBrackets)
        const netSalary = parseFloat(
          (
            grossSalary -
            (baseDeductions + lateDeductions + incomeTax + totalUnpaidDeductions)
          ).toFixed(2),
        )

        const slip = em.create(PayrollSlipEntity, {
          batchId: batch.id,
          employeeId: employee.id,
          tenantId: ctx.tenantId,
          basicSalary: salary,
          totalAllowances: allowances,
          totalDeductions: parseFloat(
            (baseDeductions + lateDeductions + incomeTax + totalUnpaidDeductions).toFixed(2),
          ),
          netSalary,
          details: {
            allowances: employee.salaryConfig?.allowances ?? [],
            deductions: employee.salaryConfig?.deductions ?? [],
            overtimePay,
            leaveDeductions: totalUnpaidDeductions,
            lateDeductions,
            incomeTax,
            overtimeHours,
            lateMinutes,
            unpaidLeaveDays,
            unpaidAbsenceDays,
            inactiveDays,
            holidayDays,
            weeklyOffDays,
            activeDays,
            workingDays: workingDayCount,
            unpaidLeaveDeductions,
            unpaidAbsenceDeductions,
            inactiveDeductions,
          },
        })

        await em.save(PayrollSlipEntity, slip)
        slips.push(slip)

        batchNetTotal += netSalary
        totalGrossSalaries += grossSalary
        totalTaxesWithheld += incomeTax
        totalBaseDeductions += baseDeductions
        totalLateDeductions += lateDeductions
        totalUnpaidLeaveDeductions += unpaidLeaveDeductions
        totalUnpaidAbsenceDeductions += unpaidAbsenceDeductions
        totalInactiveDeductions += inactiveDeductions
      }

      await payrollBatchRepo.update(batch.id, {
        totalAmount: batchNetTotal,
        status: PayrollBatchStatus.PENDING_APPROVAL,
      })

      const updatedBatch = await payrollBatchRepo.findOne({ where: { id: batch.id } })

      await this.auditLogService.log(ctx, {
        action: 'PROCESS',
        entity: 'PayrollBatch',
        entityId: batch.id,
        newValue: updatedBatch,
      })

      return { batch: updatedBatch, slipCount: slips.length }
    })
  }

  async approvePayrollBatch(batchId: string, approvedById: string, ctx: RequestContextDto) {
    await this.validateEmployeeInTenant(approvedById, ctx.tenantId)

    return await this.hrmRepo.payrollBatchRepo.manager.transaction(async (em) => {
      const payrollBatchRepo = em.getRepository(PayrollBatchEntity)
      const batch = await payrollBatchRepo.findOne({
        where: { id: batchId, tenantId: ctx.tenantId },
      })
      if (!batch) throw new NotFoundException('Payroll batch not found')

      if (
        batch.status !== PayrollBatchStatus.DRAFT &&
        batch.status !== PayrollBatchStatus.PENDING_APPROVAL
      ) {
        throw new BadRequestException(`Cannot approve a batch in ${batch.status} status`)
      }

      const slips = await this.hrmRepo.findPayrollSlipsByBatch(batchId, ctx.tenantId)
      let totalGrossSalaries = 0
      let totalTaxesWithheld = 0
      let totalBaseDeductions = 0
      let totalLateDeductions = 0
      let totalUnpaidLeaveDeductions = 0
      let totalUnpaidAbsenceDeductions = 0
      let totalInactiveDeductions = 0

      for (const slip of slips) {
        const d = slip.details
        totalGrossSalaries +=
          Number(slip.basicSalary) + Number(slip.totalAllowances) + Number(d.overtimePay ?? 0)
        totalTaxesWithheld += Number(d.incomeTax ?? 0)
        totalBaseDeductions += (d.deductions ?? []).reduce((s, x) => s + Number(x.amount), 0)
        totalLateDeductions += Number(d.lateDeductions ?? 0)
        totalUnpaidLeaveDeductions += Number(d.unpaidLeaveDeductions ?? 0)
        totalUnpaidAbsenceDeductions += Number(d.unpaidAbsenceDeductions ?? 0)
        totalInactiveDeductions += Number(d.inactiveDeductions ?? 0)
      }

      await this.accountingQueue.add(
        'post-payroll-accrual',
        {
          ctx,
          payload: {
            batchId: batch.id,
            name: batch.name,
            period: batch.period,
            totalSalary: parseFloat(
              (
                totalGrossSalaries -
                totalLateDeductions -
                totalUnpaidLeaveDeductions -
                totalUnpaidAbsenceDeductions -
                totalInactiveDeductions
              ).toFixed(2),
            ),
            totalTaxesWithheld: parseFloat(totalTaxesWithheld.toFixed(2)),
            totalDeductions: parseFloat(totalBaseDeductions.toFixed(2)),
            totalAmount: parseFloat(Number(batch.totalAmount).toFixed(2)),
          },
        },
        { removeOnComplete: true },
      )

      await payrollBatchRepo.update(batch.id, {
        status: PayrollBatchStatus.APPROVED,
        approvedById,
        approvedAt: new Date(),
      })

      const updatedBatch = await payrollBatchRepo.findOne({ where: { id: batchId } })
      await this.auditLogService.log(ctx, {
        action: 'APPROVE',
        entity: 'PayrollBatch',
        entityId: batchId,
        newValue: updatedBatch,
      })
      return updatedBatch
    })
  }

  async payPayrollBatch(batchId: string, ctx: RequestContextDto) {
    this.logger.log(`Starting payroll release run for batch ${batchId}`)
    return await this.hrmRepo.payrollBatchRepo.manager.transaction(async (em) => {
      const payrollBatchRepo = em.getRepository(PayrollBatchEntity)
      const batch = await payrollBatchRepo.findOne({
        where: { id: batchId, tenantId: ctx.tenantId },
      })
      if (!batch) throw new NotFoundException('Payroll batch not found')
      if (batch.status === PayrollBatchStatus.PAID) {
        throw new BadRequestException('Payroll batch already paid')
      }
      if (batch.status !== PayrollBatchStatus.APPROVED) {
        throw new BadRequestException(
          `Payroll batch must be APPROVED before payment. Current status: ${batch.status}`,
        )
      }

      await this.accountingQueue.add(
        'post-payroll-settlement',
        {
          ctx,
          payload: {
            batchId: batch.id,
            name: batch.name,
            totalAmount: Number(batch.totalAmount),
          },
        },
        { removeOnComplete: true },
      )

      await payrollBatchRepo.update(batch.id, {
        status: PayrollBatchStatus.PAID,
        paidAt: new Date(),
      })

      const updatedBatch = await payrollBatchRepo.findOne({
        where: { id: batchId, tenantId: ctx.tenantId },
      })

      await this.auditLogService.log(ctx, {
        action: 'PAY',
        entity: 'PayrollBatch',
        entityId: batchId,
        newValue: updatedBatch,
      })

      return updatedBatch
    })
  }

  async rejectLeave(
    requestId: string,
    rejectedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    await this.validateEmployeeInTenant(rejectedById, ctx.tenantId)

    const request = await this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
    if (!request) throw new NotFoundException('Leave request not found')
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Leave request is already ${request.status}`)
    }

    await this.hrmRepo.updateLeaveRequest(requestId, {
      status: LeaveStatus.REJECTED,
      approvedById: rejectedById,
      managerNote,
    })

    try {
      const employee = await this.hrmRepo.findEmployeeById(request.employeeId, ctx.tenantId)
      if (employee?.userId) {
        await this.notificationService.createNotification(
          {
            title: 'Leave Request Rejected',
            message: `Your leave request for ${new Date(request.startDate).toLocaleDateString()} has been rejected.`,
            type: 'ERROR',
            link: '/admin/profile',
            userId: employee.userId,
          },
          ctx.tenantId,
        )
      }
    } catch (e: any) {
      this.logger.error(`Failed to trigger leave rejection notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'REJECT',
      entity: 'LeaveRequest',
      entityId: requestId,
      newValue: { status: LeaveStatus.REJECTED },
    })
    return this.hrmRepo.findLeaveRequestById(requestId, ctx.tenantId)
  }

  async findAllPayrollBatches(ctx: RequestContextDto) {
    return this.hrmRepo.findAllPayrollBatches(ctx.tenantId)
  }

  async findPayrollSlipsByBatch(batchId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findPayrollSlipsByBatch(batchId, ctx.tenantId)
  }

  // --- Recruitment (ATS) ---
  async findAllJobPostings(ctx: RequestContextDto) {
    return this.hrmRepo.findAllJobPostings(ctx.tenantId)
  }

  async createJobPosting(data: any, ctx: RequestContextDto) {
    const requestedStatus = String(data?.status || '').toUpperCase()
    const status =
      requestedStatus === 'OPEN'
        ? JobStatus.PUBLISHED
        : Object.values(JobStatus).includes(requestedStatus as JobStatus)
          ? (requestedStatus as JobStatus)
          : JobStatus.DRAFT

    const job = await this.hrmRepo.createJobPosting({
      ...data,
      tenantId: ctx.tenantId,
      status,
    })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'JobPosting',
      entityId: job.id,
      newValue: job,
    })
    return job
  }

  async findAllApplicants(ctx: RequestContextDto) {
    return this.hrmRepo.findAllApplicants(ctx.tenantId)
  }

  async applyForJob(data: any, ctx: RequestContextDto) {
    const applicant = await this.hrmRepo.createApplicant({
      ...data,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'New Applicant',
      tenantId: ctx.tenantId,
      status: 'APPLIED',
    })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Applicant',
      entityId: applicant.id,
      newValue: applicant,
    })
    return applicant
  }

  async scheduleInterview(data: any, ctx: RequestContextDto) {
    const applicantId = data.applicantId
    const interviewerId = data.interviewerId
    const scheduledAtValue = data.scheduledAt ?? data.interviewDate
    const notes = data.notes ?? data.feedback

    if (!applicantId) {
      throw new BadRequestException('Applicant ID is required for scheduling an interview')
    }
    if (!interviewerId) {
      throw new BadRequestException('Interviewer ID is required for scheduling an interview')
    }

    const applicant = await this.hrmRepo.findApplicantById(applicantId, ctx.tenantId)
    if (!applicant) {
      throw new NotFoundException('Applicant not found')
    }

    await this.findOneEmployee(interviewerId, ctx)

    const scheduledAt = scheduledAtValue ? new Date(scheduledAtValue) : null
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('A valid interview date/time is required')
    }

    const interview = await this.hrmRepo.scheduleInterview({
      applicantId,
      interviewerId,
      scheduledAt,
      feedback: notes,
      status: data.status || 'SCHEDULED',
      tenantId: ctx.tenantId,
    })
    await this.auditLogService.log(ctx, {
      action: 'SCHEDULE',
      entity: 'Interview',
      entityId: interview.id,
      newValue: interview,
    })
    return interview
  }

  async findInterviewsByApplicant(applicantId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findInterviewsByApplicant(applicantId, ctx.tenantId)
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus, ctx: RequestContextDto) {
    await this.hrmRepo.updateApplicantStatus(id, status)
    await this.auditLogService.log(ctx, {
      action: 'UPDATE_STATUS',
      entity: 'Applicant',
      entityId: id,
      newValue: { status },
    })
    return { id, status }
  }

  async onboardApplicant(id: string, ctx: RequestContextDto) {
    const applicant = await this.hrmRepo.findApplicantById(id, ctx.tenantId)
    if (!applicant) throw new NotFoundException('Applicant not found')

    let user = await this.userService.findUserByEmail(applicant.email, ctx.tenantId)
    if (!user) {
      const secureRandomPassword = crypto.randomBytes(16).toString('hex') + 'A1!'
      this.logger.log(`Creating new user account for applicant: ${applicant.email}`)
      user = await this.userService.createUser(
        {
          email: applicant.email,
          username: applicant.email,
          name: `${applicant.firstName} ${applicant.lastName}`.trim(),
          role: UserRole.EMPLOYEE,
          password: secureRandomPassword,
          tenantId: ctx.tenantId,
        } as any,
        ctx,
      )
    }

    const humanReadableId = await this.hrmRepo.nextEmployeeId(ctx.tenantId)
    const employee = await this.hrmRepo.createEmployee({
      tenantId: ctx.tenantId,
      userId: user.id,
      departmentId: applicant.jobPosting?.departmentId,
      status: EmployeeStatus.PROBATION,
      employeeId: humanReadableId,
      joiningDate: new Date(),
    })

    // Create Personal Details
    await this.hrmRepo.personalDetailsRepo.save(
      this.hrmRepo.personalDetailsRepo.create({
        userId: user.id,
        employeeId: employee.id,
        tenantId: ctx.tenantId,
      }),
    )

    // Update applicant status to reflect onboarding completion
    await this.hrmRepo.updateApplicantStatus(id, ApplicantStatus.JOINED)

    // Trigger Notification for Admin
    try {
      const applicantName = `${applicant.firstName} ${applicant.lastName}`.trim() || 'An applicant'
      await this.notificationService.createNotification(
        {
          title: 'Applicant Onboarded Successfully',
          message: `Applicant "${applicantName}" has been onboarded as an Employee.`,
          type: 'SUCCESS',
          link: '/admin/hrm/employees',
          userId: null as any, // Send to all admins
        },
        ctx.tenantId,
      )
    } catch (e) {
      this.logger.error(`Failed to trigger applicant onboarding notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'ONBOARD',
      entity: 'Employee',
      entityId: employee.id,
      newValue: employee,
    })

    return employee
  }

  // --- Performance & KPIs ---
  async createPerformanceReview(data: any, ctx: RequestContextDto) {
    const review = await this.hrmRepo.createPerformanceReview({
      ...data,
      tenantId: ctx.tenantId,
    })
    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'PerformanceReview',
      entityId: review.id,
      newValue: review,
    })
    return review
  }

  async getEmployeePerformanceScore(employeeId: string, period: string, ctx: RequestContextDto) {
    const employee = await this.findOneEmployee(employeeId, ctx)

    const salesVolume = 0
    const pickSpeed = 0

    return {
      employeeId,
      period,
      metrics: [
        { name: 'Sales Volume', value: salesVolume, target: 50000, unit: 'USD' },
        { name: 'Fulfillment Speed', value: pickSpeed, target: 120, unit: 'sec/item' },
      ],
    }
  }

  async getAllPerformanceReviews(ctx: RequestContextDto) {
    return this.hrmRepo.findAllPerformanceReviews(ctx.tenantId)
  }

  async getEmployeeReviews(employeeId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findEmployeeReviews(employeeId, ctx.tenantId)
  }

  async seedDemoData(ctx: RequestContextDto) {
    assertProductionSafe('Demo data seeding')
    this.logger.log(`Seeding demo HRM data for tenant ${ctx.tenantId}`)

    // 1. Departments & Designations
    const itDept = await this.hrmRepo.createDepartment({
      name: 'IT & Engineering',
      tenantId: ctx.tenantId,
    })
    const salesDept = await this.hrmRepo.createDepartment({
      name: 'Sales & Marketing',
      tenantId: ctx.tenantId,
    })

    const devDes = await this.hrmRepo.createDesignation({
      name: 'Senior Developer',
      departmentId: itDept.id,
      tenantId: ctx.tenantId,
    })
    const mgrDes = await this.hrmRepo.createDesignation({
      name: 'Sales Manager',
      departmentId: salesDept.id,
      tenantId: ctx.tenantId,
    })

    // 2. Shifts
    const dayShift = await this.hrmRepo.createShift({
      name: 'Standard Day Shift',
      startTime: '09:00:00',
      endTime: '18:00:00',
      graceMinutes: 15,
      tenantId: ctx.tenantId,
    })

    const nightShift = await this.hrmRepo.createShift({
      name: 'Security Night Shift',
      startTime: '22:00:00',
      endTime: '06:00:00',
      isNightShift: true,
      graceMinutes: 30,
      tenantId: ctx.tenantId,
    })

    // 3. Find some existing entities to link
    const employeesResult = await this.hrmRepo.findEmployeesAll(ctx.tenantId)
    if (employeesResult.length === 0)
      return { message: 'Please create at least one employee first to link demo data.' }

    const emp = employeesResult[0]

    // 4. Assignments
    await this.hrmRepo.assignShift({
      employeeId: emp.id,
      shiftId: dayShift.id,
      effectiveFrom: new Date('2026-01-01'),
      tenantId: ctx.tenantId,
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
        tenantId: ctx.tenantId,
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
      tenantId: ctx.tenantId,
    })

    return { success: true, message: 'Demo data seeded successfully' }
  }

  // --- Employee Document Management ---
  async getEmployeeDocuments(employeeId: string, ctx: RequestContextDto) {
    await this.findOneEmployee(employeeId, ctx)
    return this.hrmRepo.documentRepo.find({
      where: { employeeId, tenantId: ctx.tenantId },
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
      tenantId: ctx.tenantId,
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
      where: { id: docId, tenantId: ctx.tenantId },
    })
    if (!doc) throw new NotFoundException('Document not found')
    await this.hrmRepo.documentRepo.delete(docId)

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
        tenantId: ctx.tenantId,
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
      .where('h.tenantId = :tenantId', { tenantId: ctx.tenantId })
      .orderBy('h.date', 'ASC')
    if (year) qb.andWhere('h.year = :year', { year })
    return qb.getMany()
  }

  async updateHoliday(id: string, data: UpdateHolidayDto, ctx: RequestContextDto) {
    const holiday = await this.hrmRepo.holidayRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })
    if (!holiday) throw new NotFoundException('Holiday not found')
    const update: Record<string, unknown> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.isOptional !== undefined) update.isOptional = data.isOptional
    if (data.description !== undefined) update.description = data.description
    if (data.branchId !== undefined) update.branchId = data.branchId
    if (data.date) update.date = new Date(data.date)
    await this.hrmRepo.holidayRepo.update(id, update)
    return this.hrmRepo.holidayRepo.findOne({ where: { id, tenantId: ctx.tenantId } })
  }

  async deleteHoliday(id: string, ctx: RequestContextDto) {
    const holiday = await this.hrmRepo.holidayRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })
    if (!holiday) throw new NotFoundException('Holiday not found')
    await this.hrmRepo.holidayRepo.delete(id)
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
      this.hrmRepo.taxBracketRepo.create({ ...data, tenantId: ctx.tenantId }),
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
      .where('tb.tenantId = :tenantId', { tenantId: ctx.tenantId })
      .orderBy('tb.fiscalYear', 'DESC')
      .addOrderBy('tb.sortOrder', 'ASC')
      .addOrderBy('tb.minAmount', 'ASC')
    if (fiscalYear) qb.andWhere('tb.fiscalYear = :fiscalYear', { fiscalYear })
    return qb.getMany()
  }

  async deleteTaxBracket(id: string, ctx: RequestContextDto) {
    const bracket = await this.hrmRepo.taxBracketRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })
    if (!bracket) throw new NotFoundException('Tax bracket not found')
    await this.hrmRepo.taxBracketRepo.delete(id)
    return { id }
  }

  /**
   * Diff-based document sync: only creates, updates, or deletes documents
   * that actually changed — never wipes the entire collection.
   */
  private async syncEmployeeDocuments(
    employeeId: string,
    incoming: { id?: string; documentType: string; fileUrl: string; expiryDate?: string }[],
    tenantId: string,
  ) {
    const existing = await this.hrmRepo.documentRepo.find({ where: { employeeId, tenantId } })
    const incomingIds = new Set(incoming.filter((d) => d.id).map((d) => d.id!))

    for (const doc of existing) {
      if (!incomingIds.has(doc.id)) {
        await this.hrmRepo.documentRepo.delete(doc.id)
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
          tenantId,
        })
      }
    }
  }
}
