import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ApplicantStatus, LeaveStatus } from '@/common/enums/hrm/hrm-enums'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common'
import {
  AssignShiftDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
  CreateShiftDto,
  UpdateEmployeeDto,
} from './dto/hrm.dto'
import { HrmRepository } from './hrm.repository'

@Injectable()
export class HrmService {
  private readonly logger = new Logger(HrmService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly accountingService: AccountingService,
    private readonly auditLogService: AuditLogService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async getDashboardStats(ctx: RequestContextDto) {
    return this.hrmRepo.getStats(ctx.tenantId)
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

  async updateDepartment(id: string, data: any, ctx: RequestContextDto) {
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

  async updateDesignation(id: string, data: any, ctx: RequestContextDto) {
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
    const { personalDetails, ...employeeData } = data

    const employee = await this.hrmRepo.createEmployee({
      ...employeeData,
      tenantId: ctx.tenantId,
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

    await this.auditLogService.log(ctx, {
      action: 'CREATE',
      entity: 'Employee',
      entityId: employee.id,
      newValue: employee,
    })
    return this.findOneEmployee(employee.id, ctx)
  }

  async findAllEmployees(ctx: RequestContextDto) {
    return this.hrmRepo.findAllEmployees(ctx.tenantId)
  }

  async findOneEmployee(id: string, ctx: RequestContextDto) {
    const employee = await this.hrmRepo.findEmployeeById(id, ctx.tenantId)
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto, ctx: RequestContextDto) {
    this.logger.log(`Updating employee ${id} for tenant ${ctx.tenantId}`)
    const oldEmployee = await this.findOneEmployee(id, ctx)

    const { personalDetails, ...updateData } = data
    const formattedUpdate: any = { ...updateData }
    if (data.exitDate) formattedUpdate.exitDate = new Date(data.exitDate)

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

  async updateShift(id: string, data: any, ctx: RequestContextDto) {
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

  // --- Attendance Logic (Production Refined) ---
  async clockIn(employeeId: string, ipAddress: string, ctx: RequestContextDto) {
    const employee = await this.findOneEmployee(employeeId, ctx)

    // IP Verification (Geofencing)
    const location = employee.branch
    if (location?.ipWhitelist) {
      const allowedIps = location.ipWhitelist.split(',').map((ip) => ip.trim())
      if (!allowedIps.includes(ipAddress)) {
        this.logger.warn(
          `Unauthorized clock-in attempt from IP ${ipAddress} for employee ${employeeId}`,
        )
        throw new Error('Unauthorized location. Please connect to the company network.')
      }
    }

    // Immutable Event Log
    await this.hrmRepo.logAttendanceEvent({
      employeeId,
      tenantId: ctx.tenantId,
      eventType: 'CLOCK_IN',
      ipAddress,
      source: 'WEB',
    })

    // Check for active session
    const latest = await this.hrmRepo.findLatestAttendanceSession(employeeId, ctx.tenantId)
    if (latest && !latest.clockOut) {
      throw new Error('Employee is already clocked in')
    }

    // Shift Logic (Check for lateness)
    const assignment = await this.hrmRepo.findEmployeeShift(employeeId, new Date(), ctx.tenantId)
    let lateMinutes = 0
    if (assignment?.shift) {
      const now = new Date()
      const [startH, startM] = assignment.shift.startTime.split(':').map(Number)
      const shiftStartTime = new Date(now)
      shiftStartTime.setHours(startH, startM, 0, 0)

      const graceTime = new Date(shiftStartTime)
      graceTime.setMinutes(graceTime.getMinutes() + assignment.shift.graceMinutes)

      if (now > graceTime) {
        lateMinutes = Math.floor((now.getTime() - shiftStartTime.getTime()) / (1000 * 60))
      }
    }

    return this.hrmRepo.saveAttendanceSession({
      employeeId,
      tenantId: ctx.tenantId,
      branchId: employee.branchId,
      clockIn: new Date(),
      lateMinutes,
    })
  }

  async clockOut(employeeId: string, ctx: RequestContextDto) {
    const latest = await this.hrmRepo.findLatestAttendanceSession(employeeId, ctx.tenantId)
    if (!latest || latest.clockOut) {
      throw new Error('No active clock-in session found')
    }

    // Immutable Event Log
    await this.hrmRepo.logAttendanceEvent({
      employeeId,
      tenantId: ctx.tenantId,
      eventType: 'CLOCK_OUT',
      source: 'WEB',
    })

    const clockOut = new Date()
    const diffMs = clockOut.getTime() - latest.clockIn.getTime()
    const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))

    // Simple overtime logic: anything above 8 hours
    const overtimeHours = Math.max(0, workHours - 8)

    await this.hrmRepo.saveAttendanceSession({
      ...latest,
      clockOut,
      workHours,
      overtimeHours: parseFloat(overtimeHours.toFixed(2)),
    })

    return this.findOneEmployee(employeeId, ctx)
  }

  async findAllAttendanceSessions(ctx: RequestContextDto) {
    return this.hrmRepo.findAllAttendanceSessions(ctx.tenantId)
  }

  // --- Leave Management ---
  async requestLeave(employeeId: string, data: any, ctx: RequestContextDto) {
    const quotas = await this.hrmRepo.findLeaveQuota(
      employeeId,
      new Date(data.startDate).getFullYear(),
      ctx.tenantId,
    )
    const quota = quotas.find((q) => q.leaveType === data.leaveType)

    if (quota && quota.usedDays + data.totalDays > quota.totalDays) {
      throw new Error(`Insufficient leave balance for ${data.leaveType}`)
    }

    const res = await this.hrmRepo.createLeaveRequest({
      ...data,
      employeeId,
      tenantId: ctx.tenantId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    })

    // Trigger Notification for Admin
    try {
      const employee = await this.hrmRepo.findEmployeeById(employeeId, ctx.tenantId)
      const empName = employee?.user?.name || employee?.user?.username || 'An employee'
      await this.notificationService.createNotification({
        title: 'New Leave Request Submitted',
        message: `${empName} has requested ${data.totalDays} days of ${data.leaveType} leave starting from ${new Date(data.startDate).toLocaleDateString()}.`,
        type: 'info',
        link: '/admin/hrm/leaves',
        userId: null, // Send to all admins
      }, ctx.tenantId)
    } catch (e) {
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
    const request = await (this.hrmRepo as any).leaveRequestRepo.findOne({
      where: { id: requestId, tenantId: ctx.tenantId },
    })
    if (!request) throw new NotFoundException('Leave request not found')

    await this.hrmRepo.updateLeaveRequest(requestId, {
      status: LeaveStatus.APPROVED,
      approvedById,
      managerNote,
    })

    // Update quota
    const quotas = await this.hrmRepo.findLeaveQuota(
      request.employeeId,
      new Date(request.startDate).getFullYear(),
      ctx.tenantId,
    )
    const quota = quotas.find((q) => q.leaveType === request.leaveType)
    if (quota) {
      quota.usedDays += request.totalDays
      await (this.hrmRepo as any).leaveQuotaRepo.save(quota)
    }

    // Trigger Notification for Employee
    try {
      const employee = await this.hrmRepo.findEmployeeById(request.employeeId, ctx.tenantId)
      if (employee?.userId) {
        await this.notificationService.createNotification({
          title: 'Leave Request Approved',
          message: `Your leave request for ${new Date(request.startDate).toLocaleDateString()} has been approved.`,
          type: 'success',
          link: '/admin/profile',
          userId: employee.userId,
        }, ctx.tenantId)
      }
    } catch (e) {
      this.logger.error(`Failed to trigger leave approval notification: ${e.message}`)
    }

    await this.auditLogService.log(ctx, {
      action: 'APPROVE',
      entity: 'LeaveRequest',
      entityId: requestId,
      newValue: { status: 'APPROVED' },
    })
    return request
  }

  async findAllLeaveRequests(ctx: RequestContextDto) {
    return this.hrmRepo.findAllLeaveRequests(ctx.tenantId)
  }

  // --- Payroll Engine ---
  async processPayroll(period: string, name: string, ctx: RequestContextDto) {
    this.logger.log(`Starting payroll process for period ${period}`)
    const employees = await this.hrmRepo.findAllEmployees(ctx.tenantId)

    // Month and Year parsing from period string "YYYY-MM"
    const [yearStr, monthStr] = period.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const batch = await this.hrmRepo.createPayrollBatch({
      name,
      period,
      tenantId: ctx.tenantId,
      status: 'DRAFT',
    })

    let batchNetTotal = 0
    let totalGrossSalaries = 0
    let totalTaxesWithheld = 0
    let totalDeductionsSum = 0
    const slips = []

    for (const employee of employees) {
      if (employee.status !== 'ACTIVE' && employee.status !== 'PROBATION') continue

      const salary = employee.salaryConfig?.basicSalary || 0
      const allowances =
        employee.salaryConfig?.allowances?.reduce((sum, a) => sum + Number(a.amount), 0) || 0
      const baseDeductions =
        employee.salaryConfig?.deductions?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

      // Fetch verified attendance sessions in billing period for late & overtime
      const sessions = await this.hrmRepo.findAttendanceSessionsForEmployee(
        employee.id,
        startDate,
        endDate,
        ctx.tenantId,
      )

      const overtimeHours = sessions.reduce((sum, s) => sum + Number(s.overtimeHours || 0), 0)
      const lateMinutes = sessions.reduce((sum, s) => sum + Number(s.lateMinutes || 0), 0)

      // Rates Calculations
      const hourlyRate = salary / 160
      const overtimePay = parseFloat((overtimeHours * (hourlyRate * 1.5)).toFixed(2))
      const lateDeductions = parseFloat((Math.floor(lateMinutes / 30) * (hourlyRate * 0.5)).toFixed(2))

      // Progressive Income Tax Calculations
      const grossSalary = salary + allowances + overtimePay
      let incomeTax = 0
      if (grossSalary > 3000) {
        incomeTax = 75 + (grossSalary - 3000) * 0.10
      } else if (grossSalary > 1500) {
        incomeTax = (grossSalary - 1500) * 0.05
      }
      incomeTax = parseFloat(incomeTax.toFixed(2))

      // Net Salary formula
      const netSalary = parseFloat(
        (grossSalary - (baseDeductions + lateDeductions + incomeTax)).toFixed(2),
      )

      const slip = await this.hrmRepo.createPayrollSlip({
        batchId: batch.id,
        employeeId: employee.id,
        tenantId: ctx.tenantId,
        basicSalary: salary,
        totalAllowances: allowances,
        totalDeductions: baseDeductions + lateDeductions + incomeTax,
        netSalary,
        details: {
          allowances: employee.salaryConfig?.allowances || [],
          deductions: employee.salaryConfig?.deductions || [],
          overtimePay,
          leaveDeductions: lateDeductions, // map lateDeductions to leaveDeductions for backward compatibility
          lateDeductions,
          incomeTax,
          overtimeHours,
          lateMinutes,
        },
      })

      slips.push(slip)
      batchNetTotal += netSalary
      totalGrossSalaries += grossSalary
      totalTaxesWithheld += incomeTax
      totalDeductionsSum += baseDeductions + lateDeductions
    }

    // Update batch total
    await (this.hrmRepo as any).payrollBatchRepo.update(batch.id, {
      totalAmount: batchNetTotal,
      status: 'APPROVED',
    })

    // Accounting Journal Posting (Salary Accrual Entry)
    try {
      if (this.accountingService) {
        // Debit: Salaries & Wages Expense (6000) -> Gross Salaries
        // Credit: Salaries Payable (2100) -> Net Payable
        // Credit: Payroll Tax Liabilities (2200) -> Taxes withheld
        // Credit: Miscellaneous Deductions Recovery (2150) -> Cumulative employee deductions
        await this.accountingService.createJournalEntry(
          {
            type: JournalType.GENERAL,
            description: `Salary Accrual for Period ${period}: ${name}`,
            referenceType: 'PAYROLL_BATCH',
            referenceId: batch.id,
            lines: [
              {
                accountCode: '6000',
                side: LedgerEntrySide.DEBIT,
                amount: parseFloat(totalGrossSalaries.toFixed(2)),
              },
              {
                accountCode: '2100',
                side: LedgerEntrySide.CREDIT,
                amount: parseFloat(batchNetTotal.toFixed(2)),
              },
              {
                accountCode: '2200',
                side: LedgerEntrySide.CREDIT,
                amount: parseFloat(totalTaxesWithheld.toFixed(2)),
              },
              {
                accountCode: '2100', // Offset remainder to keep COA simple if recovery accounts aren't initialized
                side: LedgerEntrySide.CREDIT,
                amount: parseFloat(totalDeductionsSum.toFixed(2)),
              },
            ].filter((line) => line.amount > 0),
          },
          ctx,
        )
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to create accrual accounting entries for payroll batch ${batch.id}: ${error.message}`,
      )
    }

    const updatedBatch = await this.hrmRepo.findPayrollBatchById(batch.id, ctx.tenantId)

    await this.auditLogService.log(ctx, {
      action: 'PROCESS',
      entity: 'PayrollBatch',
      entityId: batch.id,
      newValue: updatedBatch,
    })
    return { batch: updatedBatch, slipCount: slips.length }
  }

  async payPayrollBatch(batchId: string, ctx: RequestContextDto) {
    this.logger.log(`Starting payroll release run for batch ${batchId}`)
    const batch = await this.hrmRepo.findPayrollBatchById(batchId, ctx.tenantId)
    if (!batch) throw new NotFoundException('Payroll batch not found')
    if (batch.status === 'PAID') throw new BadRequestException('Payroll batch already paid')

    // Accounting Journal Posting (Salary Payment Settlement)
    try {
      if (this.accountingService) {
        const amountToPay = Number(batch.totalAmount)
        // Debit: Salaries Payable (2100) -> Net wages cleared
        // Credit: Cash & Bank Account (1000) -> Cash outlay
        await this.accountingService.createJournalEntry(
          {
            type: JournalType.GENERAL,
            description: `Payment Settlement for Payroll Batch: ${batch.name}`,
            referenceType: 'PAYROLL_PAYMENT',
            referenceId: batch.id,
            lines: [
              { accountCode: '2100', side: LedgerEntrySide.DEBIT, amount: amountToPay },
              { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: amountToPay },
            ],
          },
          ctx,
        )
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to post payment journal entries for batch ${batchId}: ${error.message}`,
      )
      throw new Error(`Accounting GL post failed: ${error.message}`)
    }

    await (this.hrmRepo as any).payrollBatchRepo.update(batch.id, {
      status: 'PAID',
    })

    const updatedBatch = await this.hrmRepo.findPayrollBatchById(batchId, ctx.tenantId)

    await this.auditLogService.log(ctx, {
      action: 'PAY',
      entity: 'PayrollBatch',
      entityId: batchId,
      newValue: updatedBatch,
    })

    return updatedBatch
  }

  async rejectLeave(
    requestId: string,
    rejectedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    const request = await (this.hrmRepo as any).leaveRequestRepo.findOne({
      where: { id: requestId, tenantId: ctx.tenantId },
    })
    if (!request) throw new NotFoundException('Leave request not found')

    await this.hrmRepo.updateLeaveRequest(requestId, {
      status: LeaveStatus.REJECTED as any,
      approvedById: rejectedById,
      managerNote,
    })

    // Trigger Notification for Employee
    try {
      const employee = await this.hrmRepo.findEmployeeById(request.employeeId, ctx.tenantId)
      if (employee?.userId) {
        await this.notificationService.createNotification(
          {
            title: 'Leave Request Rejected',
            message: `Your leave request for ${new Date(request.startDate).toLocaleDateString()} has been rejected.`,
            type: 'error',
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
      newValue: { status: 'REJECTED' },
    })
    return request
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
    const job = await this.hrmRepo.createJobPosting({
      ...data,
      tenantId: ctx.tenantId,
      status: data.status || 'OPEN',
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
    const interview = await this.hrmRepo.scheduleInterview({
      ...data,
      tenantId: ctx.tenantId,
      scheduledAt: new Date(data.scheduledAt),
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
    const applicant = await (this.hrmRepo as any).applicantRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
      relations: ['jobPosting'],
    })

    if (!applicant) throw new Error('Applicant not found')

    // 1. Create or Find User Account
    let user = await this.userService.findUserByEmail(applicant.email, ctx.tenantId)
    if (!user) {
      this.logger.log(`Creating new user account for applicant: ${applicant.email}`)
      user = await this.userService.createUser(
        {
          email: applicant.email,
          username: applicant.email,
          name: `${applicant.firstName} ${applicant.lastName}`,
          role: UserRole.EMPLOYEE,
          password: 'WelcomeEmployee123!', // In production, send a password reset link
          tenantId: ctx.tenantId,
        } as any,
        ctx,
      )
    }

    // 2. Create Employee record linked to User
    const employee = await this.hrmRepo.createEmployee({
      tenantId: ctx.tenantId,
      userId: user.id,
      departmentId: applicant.jobPosting.departmentId,
      status: 'PROBATION' as any,
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
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
      await this.notificationService.createNotification({
        title: 'Applicant Onboarded Successfully',
        message: `Applicant "${applicantName}" has been onboarded as an Employee.`,
        type: 'SUCCESS',
        link: '/admin/hrm/employees',
        userId: null as any, // Send to all admins
      }, ctx.tenantId)
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

    // Aggregator logic placeholder
    // In a production system, we'd query the Order and Fulfillment tables here
    const salesVolume = 0 // Query OrderEntity where createdById = employee.userId
    const pickSpeed = 0 // Query FulfillmentTaskEntity where processedById = employee.userId

    return {
      employeeId,
      period,
      metrics: [
        { name: 'Sales Volume', value: salesVolume, target: 50000, unit: 'USD' },
        { name: 'Fulfillment Speed', value: pickSpeed, target: 120, unit: 'sec/item' },
      ],
    }
  }

  // --- Demo Data Seeder ---
  async fixDatabaseSchema() {
    this.logger.log('Repairing HRM Database Schema...')
    const queryRunner = this.hrmRepo.personalDetailsRepo.manager.connection.createQueryRunner()
    await queryRunner.connect()
    try {
      // 1. Fix missing applicant columns (nullable name)
      const hasName = await queryRunner.hasColumn('applicants', 'name')
      if (hasName) {
        await queryRunner.query('ALTER TABLE applicants ALTER COLUMN "name" DROP NOT NULL')
      }

      // 1.5 Fix missing employee columns
      const hasEmpId = await queryRunner.hasColumn('employees', 'employee_id')
      if (!hasEmpId) {
        await queryRunner.query(
          'ALTER TABLE employees ADD COLUMN "employee_id" VARCHAR(255) UNIQUE',
        )
      }

      // 1.55 Fix mandatory designation constraint
      const hasDesignation = await queryRunner.hasColumn('employees', 'designation_id')
      if (hasDesignation) {
        await queryRunner.query('ALTER TABLE employees ALTER COLUMN "designation_id" DROP NOT NULL')
      }

      // 2. Fix enum values (Postgres doesn't sync enums automatically)
      const statuses = [
        'APPLIED',
        'SCREENING',
        'INTERVIEW',
        'TECHNICAL',
        'HR_ROUND',
        'OFFER',
        'JOINED',
        'REJECTED',
      ]
      for (const status of statuses) {
        try {
          await queryRunner.query(
            `ALTER TYPE applicants_status_enum ADD VALUE IF NOT EXISTS '${status}'`,
          )
        } catch (e) {
          // Ignore if value already exists
        }
      }
    } catch (err) {
      this.logger.error(`Schema repair failed: ${err.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  async seedDemoData(ctx: RequestContextDto) {
    await this.fixDatabaseSchema()
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
    const employees = await this.hrmRepo.findAllEmployees(ctx.tenantId)
    if (employees.length === 0)
      return { message: 'Please create at least one employee first to link demo data.' }

    const emp = employees[0]

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

      const clockIn = new Date(date)
      clockIn.setHours(9, Math.floor(Math.random() * 20), 0) // Randomly late or on time

      const clockOut = new Date(date)
      clockOut.setHours(18, Math.floor(Math.random() * 30), 0)

      const diffMs = clockOut.getTime() - clockIn.getTime()
      const workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))

      await this.hrmRepo.saveAttendanceSession({
        employeeId: emp.id,
        clockIn,
        clockOut,
        workHours,
        lateMinutes: clockIn.getMinutes() > 15 ? clockIn.getMinutes() - 15 : 0,
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
}
