import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { HrmRepository } from './hrm.repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CreateDepartmentDto, CreateDesignationDto, CreateEmployeeDto, UpdateEmployeeDto } from './dto/hrm.dto'
import { LeaveStatus, ApplicantStatus } from '@/common/enums/hrm/hrm-enums'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'

@Injectable()
export class HrmService {
  private readonly logger = new Logger(HrmService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly accountingService: AccountingService,
    private readonly auditLogService: AuditLogService,
  ) { }

  // --- Department CRUD ---
  async createDepartment(data: CreateDepartmentDto, ctx: RequestContextDto) {
    this.logger.log(`Creating department "${data.name}" for tenant ${ctx.tenantId}`)
    const res = await this.hrmRepo.createDepartment({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'Department', entityId: res.id, newValue: res })
    return res
  }

  async findAllDepartments(ctx: RequestContextDto) {
    return this.hrmRepo.findAllDepartments(ctx.tenantId)
  }

  // --- Designation CRUD ---
  async createDesignation(data: CreateDesignationDto, ctx: RequestContextDto) {
    this.logger.log(`Creating designation "${data.name}" for tenant ${ctx.tenantId}`)
    const res = await this.hrmRepo.createDesignation({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'Designation', entityId: res.id, newValue: res })
    return res
  }

  async findAllDesignations(ctx: RequestContextDto) {
    return this.hrmRepo.findAllDesignations(ctx.tenantId)
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
      await (this.hrmRepo as any).personalDetailsRepo.save({
        ...personalDetails,
        employeeId: employee.id,
        tenantId: ctx.tenantId,
        dob: personalDetails.dob ? new Date(personalDetails.dob) : null,
      })
    }

    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'Employee', entityId: employee.id, newValue: employee })
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
      const pd = await (this.hrmRepo as any).personalDetailsRepo.findOne({ where: { employeeId: id } })
      const pdData = {
        ...personalDetails,
        dob: personalDetails.dob ? new Date(personalDetails.dob) : undefined,
      }

      if (pd) {
        await (this.hrmRepo as any).personalDetailsRepo.update(pd.id, pdData)
      } else {
        await (this.hrmRepo as any).personalDetailsRepo.save({
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
      newValue: newEmployee
    })
    return newEmployee
  }

  // --- Shift Management ---
  async createShift(data: any, ctx: RequestContextDto) {
    return this.hrmRepo.createShift({ ...data, tenantId: ctx.tenantId })
  }

  async assignShift(employeeId: string, data: any, ctx: RequestContextDto) {
    return this.hrmRepo.assignShift({
      ...data,
      employeeId,
      tenantId: ctx.tenantId,
      effectiveFrom: new Date(data.effectiveFrom),
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
    })
  }

  // --- Attendance Logic (Production Refined) ---
  async clockIn(employeeId: string, ipAddress: string, ctx: RequestContextDto) {
    const employee = await this.findOneEmployee(employeeId, ctx)

    // IP Verification (Geofencing)
    const location = employee.branch || employee.warehouse
    if (location?.ipWhitelist) {
      const allowedIps = location.ipWhitelist.split(',').map(ip => ip.trim())
      if (!allowedIps.includes(ipAddress)) {
        this.logger.warn(`Unauthorized clock-in attempt from IP ${ipAddress} for employee ${employeeId}`)
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
      warehouseId: employee.warehouseId,
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

  // --- Leave Management ---
  async requestLeave(employeeId: string, data: any, ctx: RequestContextDto) {
    const quotas = await this.hrmRepo.findLeaveQuota(employeeId, new Date(data.startDate).getFullYear(), ctx.tenantId)
    const quota = quotas.find(q => q.leaveType === data.leaveType)

    if (quota && (quota.usedDays + data.totalDays > quota.totalDays)) {
      throw new Error(`Insufficient leave balance for ${data.leaveType}`)
    }

    const res = await this.hrmRepo.createLeaveRequest({
      ...data,
      employeeId,
      tenantId: ctx.tenantId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    })

    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'LeaveRequest', entityId: res.id, newValue: res })
    return res
  }

  async approveLeave(requestId: string, approvedById: string, managerNote: string, ctx: RequestContextDto) {
    const request = await (this.hrmRepo as any).leaveRequestRepo.findOne({ where: { id: requestId, tenantId: ctx.tenantId } })
    if (!request) throw new NotFoundException('Leave request not found')

    await this.hrmRepo.updateLeaveRequest(requestId, {
      status: LeaveStatus.APPROVED,
      approvedById,
      managerNote,
    })

    // Update quota
    const quotas = await this.hrmRepo.findLeaveQuota(request.employeeId, new Date(request.startDate).getFullYear(), ctx.tenantId)
    const quota = quotas.find(q => q.leaveType === request.leaveType)
    if (quota) {
      quota.usedDays += request.totalDays
      await (this.hrmRepo as any).leaveQuotaRepo.save(quota)
    }

    await this.auditLogService.log(ctx, { action: 'APPROVE', entity: 'LeaveRequest', entityId: requestId, newValue: { status: 'APPROVED' } })
    return request
  }

  // --- Payroll Engine ---
  async processPayroll(period: string, name: string, ctx: RequestContextDto) {
    this.logger.log(`Starting payroll process for period ${period}`)
    const employees = await this.hrmRepo.findAllEmployees(ctx.tenantId)

    const batch = await this.hrmRepo.createPayrollBatch({
      name,
      period,
      tenantId: ctx.tenantId,
      status: 'DRAFT',
    })

    let batchTotal = 0
    const slips = []

    for (const employee of employees) {
      if (employee.status !== 'ACTIVE' && employee.status !== 'PROBATION') continue

      const salary = employee.salaryConfig?.basicSalary || 0
      const allowances = employee.salaryConfig?.allowances?.reduce((sum, a) => sum + Number(a.amount), 0) || 0
      const deductions = employee.salaryConfig?.deductions?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

      // Placeholder for complex production logic (e.g. counting work_hours from sessions)
      const overtimePay = 0
      const leaveDeductions = 0

      const netSalary = salary + allowances + overtimePay - (deductions + leaveDeductions)

      const slip = await this.hrmRepo.createPayrollSlip({
        batchId: batch.id,
        employeeId: employee.id,
        tenantId: ctx.tenantId,
        basicSalary: salary,
        totalAllowances: allowances,
        totalDeductions: deductions,
        netSalary,
        details: {
          allowances: employee.salaryConfig?.allowances || [],
          deductions: employee.salaryConfig?.deductions || [],
          overtimePay,
          leaveDeductions,
        },
      })

      slips.push(slip)
      batchTotal += netSalary
    }

    // Update batch total
    await (this.hrmRepo as any).payrollBatchRepo.update(batch.id, {
      totalAmount: batchTotal,
      status: 'APPROVED'
    })

    // Accounting Integration
    try {
      const journal = await this.accountingService.createJournalEntry({
        type: JournalType.GENERAL,
        description: `Payroll for ${period}: ${name}`,
        referenceType: 'PAYROLL_BATCH',
        referenceId: batch.id,
        lines: [
          { accountCode: '6000', side: LedgerEntrySide.DEBIT, amount: batchTotal }, // Salaries & Wages Expense
          { accountCode: '2100', side: LedgerEntrySide.CREDIT, amount: batchTotal }, // Salaries Payable (Liability)
        ],
      }, ctx)

      await (this.hrmRepo as any).payrollBatchRepo.update(batch.id, {
        journalEntryId: journal.id,
        status: 'PAID'
      })
    } catch (error) {
      this.logger.error(`Failed to create accounting entries for payroll ${batch.id}: ${error.message}`)
    }

    await this.auditLogService.log(ctx, { action: 'PROCESS', entity: 'PayrollBatch', entityId: batch.id, newValue: batch })
    return { batch, slipCount: slips.length }
  }

  // --- Recruitment (ATS) ---
  async createJobPosting(data: any, ctx: RequestContextDto) {
    const job = await this.hrmRepo.createJobPosting({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'JobPosting', entityId: job.id, newValue: job })
    return job
  }

  async applyForJob(data: any, ctx: RequestContextDto) {
    const applicant = await this.hrmRepo.createApplicant({ ...data, tenantId: ctx.tenantId })
    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'Applicant', entityId: applicant.id, newValue: applicant })
    return applicant
  }

  async scheduleInterview(data: any, ctx: RequestContextDto) {
    const interview = await this.hrmRepo.scheduleInterview({
      ...data,
      tenantId: ctx.tenantId,
      scheduledAt: new Date(data.scheduledAt),
    })
    await this.auditLogService.log(ctx, { action: 'SCHEDULE', entity: 'Interview', entityId: interview.id, newValue: interview })
    return interview
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus, ctx: RequestContextDto) {
    await this.hrmRepo.updateApplicantStatus(id, status)
    await this.auditLogService.log(ctx, { action: 'UPDATE_STATUS', entity: 'Applicant', entityId: id, newValue: { status } })
    return { id, status }
  }

  // --- Performance & KPIs ---
  async createPerformanceReview(data: any, ctx: RequestContextDto) {
    const review = await this.hrmRepo.createPerformanceReview({
      ...data,
      tenantId: ctx.tenantId,
    })
    await this.auditLogService.log(ctx, { action: 'CREATE', entity: 'PerformanceReview', entityId: review.id, newValue: review })
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
        { name: 'Sales Volume', value: salesVolume, unit: 'Currency' },
        { name: 'Picking Speed', value: pickSpeed, unit: 'Tasks/Hr' },
      ],
      overallScore: 0, // Calculated based on weighted metrics
    }
  }
}
