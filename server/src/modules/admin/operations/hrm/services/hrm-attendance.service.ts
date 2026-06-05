import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AttendanceSource } from '@/common/enums/hrm/hrm-enums'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { AssignShiftDto, CreateShiftDto, UpdateShiftDto } from '../dto/hrm.dto'
import {
  computeLateMinutes,
  computeOvertimeHours,
  isIpAllowed,
} from '../hrm.helpers'
import { HrmRepository } from '../hrm.repository'
import { HrmEmployeeService } from './hrm-employee.service'

@Injectable()
export class HrmAttendanceService {
  private readonly logger = new Logger(HrmAttendanceService.name)

  constructor(
    private readonly hrmRepo: HrmRepository,
    private readonly auditLogService: AuditLogService,
    private readonly employeeService: HrmEmployeeService,
  ) {}

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
    await this.employeeService.validateEmployeeInTenant(employeeId, ctx.tenantId)
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
    const employee = await this.employeeService.findOneEmployee(employeeId, ctx)

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

    return this.employeeService.findOneEmployee(employeeId, ctx)
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
}
