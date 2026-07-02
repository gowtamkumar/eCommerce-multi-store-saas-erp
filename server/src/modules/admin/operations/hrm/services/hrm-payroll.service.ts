import { RequestContextDto } from '@/common/dto/request-context.dto'
import {
  EmployeeStatus,
  LeaveStatus,
  PayrollBatchStatus,
} from '@/common/enums/hrm/hrm-enums'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Queue } from 'bullmq'
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { AttendanceSessionEntity } from '../entities/attendance.entity'
import { EmployeeEntity } from '../entities/employee.entity'
import { LeaveRequestEntity } from '../entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from '../entities/payroll.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import {
  buildCheckInDateSet,
  buildHolidayDateSet,
  classifyPayrollDays,
  computeIncomeTax,
  resolveWorkingDays,
  toDateString,
} from '../hrm.helpers'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'

@Injectable()
export class HrmPayrollService {
  private readonly logger = new Logger(HrmPayrollService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    @InjectQueue('accounting') private readonly accountingQueue: Queue,
    private readonly auditLogService: AuditLogService,
    private readonly employeeService: HrmEmployeeService,
  ) {}

  // --- Payroll Engine ---
  async processPayroll(period: string, name: string, ctx: RequestContextDto) {
    this.logger.log(`Starting payroll process for period ${period}`)

    const existing = await this.hrmRepo.findActivePayrollBatchForPeriod(ctx.storeId, period)
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

    const holidays = await this.hrmRepo.findHolidaysInRange(ctx.storeId, startDate, endDate)
    const holidayDateSet = buildHolidayDateSet(holidays)

    const taxBrackets = await this.hrmRepo.taxBracketRepo.find({
      where: { storeId: ctx.storeId, fiscalYear: year },
      order: { sortOrder: 'ASC', minAmount: 'ASC' },
    })

    return await this.hrmRepo.employeeRepo.manager.transaction(async (em) => {
      const siteSettings = await em.findOne(SiteSettingsEntity, {
        where: { storeId: ctx.storeId },
      })
      const employeeRepo = em.getRepository(EmployeeEntity)
      const leaveRequestRepo = em.getRepository(LeaveRequestEntity)
      const attendanceSessionRepo = em.getRepository(AttendanceSessionEntity)
      const payrollBatchRepo = em.getRepository(PayrollBatchEntity)

      const employees = await employeeRepo.find({
        where: { storeId: ctx.storeId },
        relations: {
          user: true,
          department: true,
          designation: true,
          branch: true,
          manager: true,
          personalDetails: true,
        },
      })

      const activeEmployees = employees.filter(
        (e) => e.status === EmployeeStatus.ACTIVE || e.status === EmployeeStatus.PROBATION,
      )
      const employeeIds = activeEmployees.map((e) => e.id)

      const [approvedLeaves, allSessions] = await Promise.all([
        leaveRequestRepo.find({
          where: {
            storeId: ctx.storeId,
            status: LeaveStatus.APPROVED,
            startDate: LessThanOrEqual(endDate),
            endDate: MoreThanOrEqual(startDate),
          },
        }),
        employeeIds.length > 0
          ? attendanceSessionRepo.find({
              where: {
                employeeId: In(employeeIds),
                storeId: ctx.storeId,
                checkIn: Between(startDate, endDate),
              },
              order: { checkIn: 'ASC' },
            })
          : Promise.resolve([]),
      ])

      const shiftAssignments = await this.hrmRepo.findEmployeeShiftsForEmployees(
        employeeIds,
        startDate,
        ctx.storeId,
      )

      const assignmentMap = new Map<string, typeof shiftAssignments[0]>()
      for (const assignment of shiftAssignments) {
        if (!assignmentMap.has(assignment.employeeId)) {
          assignmentMap.set(assignment.employeeId, assignment)
        }
      }

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
          storeId: ctx.storeId,
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

        const standardMonthlyHours = Number(employee.salaryConfig?.standardMonthlyHours ?? siteSettings?.financeConfig?.hrmStandardMonthlyHours ?? 160)
        const overtimeMultiplier = Number(employee.salaryConfig?.overtimeMultiplier ?? siteSettings?.financeConfig?.hrmOvertimeMultiplier ?? 1.5)
        const lateDeductionMultiplier = Number(employee.salaryConfig?.lateDeductionMultiplier ?? siteSettings?.financeConfig?.hrmLateDeductionMultiplier ?? 0.5)

        const hourlyRate = standardMonthlyHours > 0 ? salary / standardMonthlyHours : 0
        const overtimePay = parseFloat((overtimeHours * hourlyRate * overtimeMultiplier).toFixed(2))
        const lateDeductions = parseFloat(
          (Math.floor(lateMinutes / 30) * (hourlyRate * lateDeductionMultiplier)).toFixed(2),
        )

        const assignment = assignmentMap.get(employee.id) ?? null
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
          storeId: ctx.storeId,
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
    await this.employeeService.validateEmployeeInStore(approvedById, ctx.storeId)

    return await this.hrmRepo.payrollBatchRepo.manager.transaction(async (em) => {
      const payrollBatchRepo = em.getRepository(PayrollBatchEntity)
      const batch = await payrollBatchRepo.findOne({
        where: { id: batchId, storeId: ctx.storeId },
      })
      if (!batch) throw new NotFoundException('Payroll batch not found')

      if (
        batch.status !== PayrollBatchStatus.DRAFT &&
        batch.status !== PayrollBatchStatus.PENDING_APPROVAL
      ) {
        throw new BadRequestException(`Cannot approve a batch in ${batch.status} status`)
      }

      const slips = await this.hrmRepo.findPayrollSlipsByBatch(batchId, ctx.storeId)
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
        where: { id: batchId, storeId: ctx.storeId },
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
        where: { id: batchId, storeId: ctx.storeId },
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

  async findAllPayrollBatches(ctx: RequestContextDto) {
    return this.hrmRepo.findAllPayrollBatches(ctx.storeId)
  }

  async findPayrollSlipsByBatch(batchId: string, ctx: RequestContextDto) {
    return this.hrmRepo.findPayrollSlipsByBatch(batchId, ctx.storeId)
  }
}
