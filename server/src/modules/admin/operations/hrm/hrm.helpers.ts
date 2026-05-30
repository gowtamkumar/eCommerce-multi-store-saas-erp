import { BadRequestException } from '@nestjs/common'
import { EmployeeShiftAssignmentEntity } from './entities/shift.entity'
import { HolidayEntity } from './entities/holiday.entity'
import { TaxBracketEntity } from './entities/tax-bracket.entity'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { LeaveRequestEntity } from './entities/leave.entity'
import { LeaveType } from '@/common/enums/hrm/hrm-enums'

/** Format a Date as YYYY-MM-DD in local time. */
export function toDateString(date: Date | string): string {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Count calendar days between two dates (inclusive). */
export function countCalendarDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  if (end < start) return 0
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

/**
 * Compute late minutes for a check-in against the assigned shift.
 * Handles night shifts that cross midnight and applies grace correctly
 * (minutes counted from graceTime, not shiftStartTime).
 */
export function computeLateMinutes(
  now: Date,
  assignment: EmployeeShiftAssignmentEntity | null,
): number {
  if (!assignment?.shift) return 0

  const shift = assignment.shift
  const [startH, startM] = shift.startTime.split(':').map(Number)

  const shiftStart = new Date(now)
  shiftStart.setHours(startH, startM, 0, 0)

  // Night shift: if current time is before noon and shift starts in the evening,
  // the shift start was yesterday evening.
  if (shift.isNightShift && now.getHours() < 12 && startH >= 12) {
    shiftStart.setDate(shiftStart.getDate() - 1)
  }

  const graceEnd = new Date(shiftStart)
  graceEnd.setMinutes(graceEnd.getMinutes() + (shift.graceMinutes ?? 0))

  if (now <= graceEnd) return 0
  return Math.floor((now.getTime() - graceEnd.getTime()) / (1000 * 60))
}

/**
 * Compute overtime hours from a check-in/check-out pair.
 * Uses shift end time when available; falls back to 8 h standard day.
 */
export function computeOvertimeHours(
  checkIn: Date,
  checkOut: Date,
  assignment: EmployeeShiftAssignmentEntity | null,
): number {
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const workHours = diffMs / (1000 * 60 * 60)

  if (assignment?.shift) {
    const [startH, startM] = assignment.shift.startTime.split(':').map(Number)
    const [endH, endM] = assignment.shift.endTime.split(':').map(Number)
    let shiftDurationH = endH + endM / 60 - (startH + startM / 60)
    if (shiftDurationH <= 0) shiftDurationH += 24 // night shift
    return Math.max(0, parseFloat((workHours - shiftDurationH).toFixed(2)))
  }

  return Math.max(0, parseFloat((workHours - 8).toFixed(2)))
}

/** Default working days Mon-Fri when shift has no workingDays configured. */
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]

export interface DayClassification {
  isActive: boolean
  isHoliday: boolean
  isWeeklyOff: boolean
  isWorkingDay: boolean
  hasCheckIn: boolean
  leaveOnDay: LeaveRequestEntity | null
  isUnpaidLeave: boolean
  isUnpaidAbsence: boolean
}

/**
 * Classify each day in a payroll period for one employee.
 * Used by processPayroll to compute deductions without N+1 queries.
 */
export function classifyPayrollDays(params: {
  year: number
  month: number
  totalDaysInMonth: number
  joiningDateStr: string
  exitDateStr: string | null
  workingDays: number[]
  holidayDateSet: Set<string>
  checkInDateSet: Set<string>
  approvedLeaves: LeaveRequestEntity[]
}): DayClassification[] {
  const {
    year,
    month,
    totalDaysInMonth,
    joiningDateStr,
    exitDateStr,
    workingDays,
    holidayDateSet,
    checkInDateSet,
    approvedLeaves,
  } = params

  const result: DayClassification[] = []

  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const currentDate = new Date(year, month - 1, dayNum)
    const currentStr = toDateString(currentDate)
    const dayOfWeek = currentDate.getDay()

    const isActive =
      currentStr >= joiningDateStr && (!exitDateStr || currentStr <= exitDateStr)
    const isHoliday = holidayDateSet.has(currentStr)
    const isWeeklyOff = !workingDays.includes(dayOfWeek)
    const isWorkingDay = isActive && !isHoliday && !isWeeklyOff

    const leaveOnDay =
      approvedLeaves.find((l) => {
        const startStr = toDateString(l.startDate)
        const endStr = toDateString(l.endDate)
        return currentStr >= startStr && currentStr <= endStr
      }) ?? null

    const hasCheckIn = checkInDateSet.has(currentStr)
    const isUnpaidLeave = !!leaveOnDay && leaveOnDay.leaveType === LeaveType.UNPAID
    const isUnpaidAbsence = isWorkingDay && !leaveOnDay && !hasCheckIn

    result.push({
      isActive,
      isHoliday,
      isWeeklyOff,
      isWorkingDay,
      hasCheckIn,
      leaveOnDay,
      isUnpaidLeave,
      isUnpaidAbsence,
    })
  }

  return result
}

/**
 * Progressive income tax from tenant-configured brackets.
 * Falls back to a sensible default two-bracket schedule when none configured.
 */
export function computeIncomeTax(
  grossSalary: number,
  brackets: TaxBracketEntity[],
): number {
  if (grossSalary <= 0) return 0

  const sorted =
    brackets.length > 0
      ? [...brackets].sort((a, b) => Number(a.minAmount) - Number(b.minAmount))
      : getDefaultTaxBrackets()

  let tax = 0
  for (const bracket of sorted) {
    const min = Number(bracket.minAmount)
    const max = bracket.maxAmount != null ? Number(bracket.maxAmount) : Infinity
    if (grossSalary <= min) continue

    const taxableInBracket = Math.min(grossSalary, max) - min
    if (taxableInBracket <= 0) continue

    tax = Number(bracket.flatTax ?? 0) + taxableInBracket * Number(bracket.rate)
    if (grossSalary <= max) break
  }

  return parseFloat(tax.toFixed(2))
}

function getDefaultTaxBrackets(): TaxBracketEntity[] {
  return [
    { minAmount: 0, maxAmount: 1500, rate: 0, flatTax: 0 } as TaxBracketEntity,
    { minAmount: 1500, maxAmount: 3000, rate: 0.05, flatTax: 0 } as TaxBracketEntity,
    { minAmount: 3000, maxAmount: null, rate: 0.1, flatTax: 75 } as TaxBracketEntity,
  ]
}

/** Build a Set of YYYY-MM-DD strings from holiday entities. */
export function buildHolidayDateSet(holidays: HolidayEntity[]): Set<string> {
  return new Set(holidays.map((h) => toDateString(h.date)))
}

/** Build a Set of YYYY-MM-DD strings from attendance sessions (deduped per day). */
export function buildCheckInDateSet(sessions: AttendanceSessionEntity[]): Set<string> {
  return new Set(sessions.map((s) => toDateString(s.checkIn)))
}

/** Resolve working days from shift assignment, falling back to Mon-Fri. */
export function resolveWorkingDays(
  assignment: EmployeeShiftAssignmentEntity | null,
): number[] {
  const days = assignment?.shift?.workingDays
  return days && days.length > 0 ? days : DEFAULT_WORKING_DAYS
}

/** Validate that an IP is in the branch whitelist (exact match or CIDR prefix). */
export function isIpAllowed(ip: string, whitelist: string): boolean {
  const allowed = whitelist.split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.length === 0) return true

  for (const entry of allowed) {
    if (entry.includes('/')) {
      if (ipMatchesCidr(ip, entry)) return true
    } else if (ip === entry) {
      return true
    }
  }
  return false
}

function ipMatchesCidr(ip: string, cidr: string): boolean {
  try {
    const [range, bitsStr] = cidr.split('/')
    const bits = parseInt(bitsStr, 10)
    const ipNum = ipToNumber(ip)
    const rangeNum = ipToNumber(range)
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
    return (ipNum & mask) === (rangeNum & mask)
  } catch {
    return false
  }
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0
}

export function assertProductionSafe(action: string): void {
  if (process.env.NODE_ENV === 'production') {
    throw new BadRequestException(`${action} is disabled in production environments`)
  }
}
