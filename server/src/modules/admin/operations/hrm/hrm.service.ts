import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ApplicantStatus, AttendanceSource, LeaveType } from '@/common/enums/hrm/hrm-enums'
import { Injectable } from '@nestjs/common'
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
import { HrmAttendanceService } from './services/hrm-attendance.service'
import { HrmEmployeeService } from './services/hrm-employee.service'
import { HrmLeaveService } from './services/hrm-leave.service'
import { HrmOrganizationService } from './services/hrm-organization.service'
import { HrmPayrollService } from './services/hrm-payroll.service'
import { HrmPerformanceService } from './services/hrm-performance.service'
import { HrmRecruitmentService } from './services/hrm-recruitment.service'

/**
 * Thin facade over the HRM domain services. Keeps the controller-facing public
 * surface intact while delegating each operation to its domain service.
 */
@Injectable()
export class HrmService {
  constructor(
    private readonly organizationService: HrmOrganizationService,
    private readonly employeeService: HrmEmployeeService,
    private readonly attendanceService: HrmAttendanceService,
    private readonly leaveService: HrmLeaveService,
    private readonly payrollService: HrmPayrollService,
    private readonly recruitmentService: HrmRecruitmentService,
    private readonly performanceService: HrmPerformanceService,
  ) {}

  async getDashboardStats(ctx: RequestContextDto) {
    return this.employeeService.getDashboardStats(ctx)
  }

  // --- Department CRUD ---
  async createDepartment(data: CreateDepartmentDto, ctx: RequestContextDto) {
    return this.organizationService.createDepartment(data, ctx)
  }

  async findAllDepartments(ctx: RequestContextDto) {
    return this.organizationService.findAllDepartments(ctx)
  }

  async updateDepartment(id: string, data: UpdateDepartmentDto, ctx: RequestContextDto) {
    return this.organizationService.updateDepartment(id, data, ctx)
  }

  async deleteDepartment(id: string, ctx: RequestContextDto) {
    return this.organizationService.deleteDepartment(id, ctx)
  }

  // --- Designation CRUD ---
  async createDesignation(data: CreateDesignationDto, ctx: RequestContextDto) {
    return this.organizationService.createDesignation(data, ctx)
  }

  async findAllDesignations(ctx: RequestContextDto) {
    return this.organizationService.findAllDesignations(ctx)
  }

  async updateDesignation(id: string, data: UpdateDesignationDto, ctx: RequestContextDto) {
    return this.organizationService.updateDesignation(id, data, ctx)
  }

  async deleteDesignation(id: string, ctx: RequestContextDto) {
    return this.organizationService.deleteDesignation(id, ctx)
  }

  // --- Employee CRUD ---
  async createEmployee(data: CreateEmployeeDto, ctx: RequestContextDto) {
    return this.employeeService.createEmployee(data, ctx)
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
    return this.employeeService.findAllEmployees(ctx, options)
  }

  async findOneEmployee(id: string, ctx: RequestContextDto) {
    return this.employeeService.findOneEmployee(id, ctx)
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto, ctx: RequestContextDto) {
    return this.employeeService.updateEmployee(id, data, ctx)
  }

  // --- Shift Management ---
  async createShift(data: CreateShiftDto, ctx: RequestContextDto) {
    return this.attendanceService.createShift(data, ctx)
  }

  async findAllShifts(ctx: RequestContextDto) {
    return this.attendanceService.findAllShifts(ctx)
  }

  async updateShift(id: string, data: UpdateShiftDto, ctx: RequestContextDto) {
    return this.attendanceService.updateShift(id, data, ctx)
  }

  async deleteShift(id: string, ctx: RequestContextDto) {
    return this.attendanceService.deleteShift(id, ctx)
  }

  async assignShift(employeeId: string, data: AssignShiftDto, ctx: RequestContextDto) {
    return this.attendanceService.assignShift(employeeId, data, ctx)
  }

  async findEmployeeShiftAssignments(employeeId: string, ctx: RequestContextDto) {
    return this.attendanceService.findEmployeeShiftAssignments(employeeId, ctx)
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
    return this.attendanceService.checkIn(employeeId, ipAddress, ctx, options)
  }

  async checkOut(
    employeeId: string,
    ctx: RequestContextDto,
    options?: { source?: AttendanceSource; deviceId?: string },
  ) {
    return this.attendanceService.checkOut(employeeId, ctx, options)
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
    return this.attendanceService.findAllAttendanceSessions(ctx, options)
  }

  // --- Leave Management ---
  async requestLeave(
    employeeId: string,
    data: { leaveType: LeaveType; startDate: string; endDate: string; reason: string },
    ctx: RequestContextDto,
  ) {
    return this.leaveService.requestLeave(employeeId, data, ctx)
  }

  async approveLeave(
    requestId: string,
    approvedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    return this.leaveService.approveLeave(requestId, approvedById, managerNote, ctx)
  }

  async rejectLeave(
    requestId: string,
    rejectedById: string,
    managerNote: string,
    ctx: RequestContextDto,
  ) {
    return this.leaveService.rejectLeave(requestId, rejectedById, managerNote, ctx)
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
    return this.leaveService.findAllLeaveRequests(ctx, options)
  }

  // --- Payroll Engine ---
  async processPayroll(period: string, name: string, ctx: RequestContextDto) {
    return this.payrollService.processPayroll(period, name, ctx)
  }

  async approvePayrollBatch(batchId: string, approvedById: string, ctx: RequestContextDto) {
    return this.payrollService.approvePayrollBatch(batchId, approvedById, ctx)
  }

  async payPayrollBatch(batchId: string, ctx: RequestContextDto) {
    return this.payrollService.payPayrollBatch(batchId, ctx)
  }

  async findAllPayrollBatches(ctx: RequestContextDto) {
    return this.payrollService.findAllPayrollBatches(ctx)
  }

  async findPayrollSlipsByBatch(batchId: string, ctx: RequestContextDto) {
    return this.payrollService.findPayrollSlipsByBatch(batchId, ctx)
  }

  // --- Recruitment (ATS) ---
  async findAllJobPostings(ctx: RequestContextDto) {
    return this.recruitmentService.findAllJobPostings(ctx)
  }

  async createJobPosting(data: any, ctx: RequestContextDto) {
    return this.recruitmentService.createJobPosting(data, ctx)
  }

  async findAllApplicants(ctx: RequestContextDto) {
    return this.recruitmentService.findAllApplicants(ctx)
  }

  async applyForJob(data: any, ctx: RequestContextDto) {
    return this.recruitmentService.applyForJob(data, ctx)
  }

  async scheduleInterview(data: any, ctx: RequestContextDto) {
    return this.recruitmentService.scheduleInterview(data, ctx)
  }

  async findInterviewsByApplicant(applicantId: string, ctx: RequestContextDto) {
    return this.recruitmentService.findInterviewsByApplicant(applicantId, ctx)
  }

  async updateApplicantStatus(id: string, status: ApplicantStatus, ctx: RequestContextDto) {
    return this.recruitmentService.updateApplicantStatus(id, status, ctx)
  }

  async onboardApplicant(id: string, ctx: RequestContextDto) {
    return this.recruitmentService.onboardApplicant(id, ctx)
  }

  // --- Performance & KPIs ---
  async createPerformanceReview(data: any, ctx: RequestContextDto) {
    return this.performanceService.createPerformanceReview(data, ctx)
  }

  async getEmployeePerformanceScore(employeeId: string, period: string, ctx: RequestContextDto) {
    return this.performanceService.getEmployeePerformanceScore(employeeId, period, ctx)
  }

  async getAllPerformanceReviews(ctx: RequestContextDto) {
    return this.performanceService.getAllPerformanceReviews(ctx)
  }

  async getEmployeeReviews(employeeId: string, ctx: RequestContextDto) {
    return this.performanceService.getEmployeeReviews(employeeId, ctx)
  }

  async seedDemoData(ctx: RequestContextDto) {
    return this.employeeService.seedDemoData(ctx)
  }

  // --- Employee Document Management ---
  async getEmployeeDocuments(employeeId: string, ctx: RequestContextDto) {
    return this.employeeService.getEmployeeDocuments(employeeId, ctx)
  }

  async addEmployeeDocument(
    employeeId: string,
    data: { documentType: string; fileUrl: string; expiryDate?: string },
    ctx: RequestContextDto,
  ) {
    return this.employeeService.addEmployeeDocument(employeeId, data, ctx)
  }

  async deleteEmployeeDocument(docId: string, ctx: RequestContextDto) {
    return this.employeeService.deleteEmployeeDocument(docId, ctx)
  }

  // --- Holiday Management ---
  async createHoliday(data: CreateHolidayDto, ctx: RequestContextDto) {
    return this.employeeService.createHoliday(data, ctx)
  }

  async findAllHolidays(ctx: RequestContextDto, year?: number) {
    return this.employeeService.findAllHolidays(ctx, year)
  }

  async updateHoliday(id: string, data: UpdateHolidayDto, ctx: RequestContextDto) {
    return this.employeeService.updateHoliday(id, data, ctx)
  }

  async deleteHoliday(id: string, ctx: RequestContextDto) {
    return this.employeeService.deleteHoliday(id, ctx)
  }

  // --- Tax Bracket Management ---
  async createTaxBracket(data: CreateTaxBracketDto, ctx: RequestContextDto) {
    return this.employeeService.createTaxBracket(data, ctx)
  }

  async findAllTaxBrackets(ctx: RequestContextDto, fiscalYear?: number) {
    return this.employeeService.findAllTaxBrackets(ctx, fiscalYear)
  }

  async deleteTaxBracket(id: string, ctx: RequestContextDto) {
    return this.employeeService.deleteTaxBracket(id, ctx)
  }
}
