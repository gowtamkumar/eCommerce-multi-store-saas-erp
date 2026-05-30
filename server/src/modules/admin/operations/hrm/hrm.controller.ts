import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BranchScopeGuard } from '@/common/guards/branch-scope.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import {
  AddEmployeeDocumentDto,
  ApproveLeaveDto,
  ApprovePayrollBatchDto,
  AssignShiftDto,
  AttendanceQueryDto,
  CheckInDto,
  CreateApplicantDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
  CreateHolidayDto,
  CreateJobPostingDto,
  CreatePerformanceReviewDto,
  CreateShiftDto,
  CreateTaxBracketDto,
  EmployeeQueryDto,
  LeaveQueryDto,
  ProcessPayrollDto,
  RejectLeaveDto,
  RequestLeaveDto,
  ScheduleInterviewDto,
  UpdateApplicantStatusDto,
  UpdateDepartmentDto,
  UpdateDesignationDto,
  UpdateEmployeeDto,
  UpdateHolidayDto,
  UpdateShiftDto,
} from './dto/hrm.dto'
import { HrmService } from './hrm.service'

@ApiTags('HRM')
@UseGuards(JwtAuthGuard, SubscriptionGuard, BranchScopeGuard)
@RequireFeature('hrm')
@Controller('operations/hrm')
export class HrmController {
  private readonly logger = new Logger(HrmController.name)

  constructor(private readonly hrmService: HrmService) {}

  @Get('dashboard/stats')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  @ApiOperation({ summary: 'Get HRM dashboard statistics' })
  async getDashboardStats(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.getDashboardStats(ctx)
    return { success: true, statusCode: 200, message: 'Dashboard stats fetched', data: res }
  }

  // --- Departments ---
  @Post('departments')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async createDepartment(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateDepartmentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createDepartment(data, ctx)
    return { success: true, statusCode: 201, message: 'Department created successfully', data: res }
  }

  @Get('departments')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findAllDepartments(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllDepartments(ctx)
    return { success: true, statusCode: 200, message: 'Departments retrieved successfully', data: res }
  }

  @Patch('departments/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async updateDepartment(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateDepartmentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateDepartment(id, data, ctx)
    return { success: true, statusCode: 200, message: 'Department updated successfully', data: res }
  }

  @Delete('departments/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async deleteDepartment(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.deleteDepartment(id, ctx)
    return { success: true, statusCode: 200, message: 'Department deleted successfully', data: res }
  }

  // --- Designations ---
  @Post('designations')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async createDesignation(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateDesignationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createDesignation(data, ctx)
    return { success: true, statusCode: 201, message: 'Designation created successfully', data: res }
  }

  @Get('designations')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findAllDesignations(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllDesignations(ctx)
    return { success: true, statusCode: 200, message: 'Designations retrieved successfully', data: res }
  }

  @Patch('designations/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async updateDesignation(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateDesignationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateDesignation(id, data, ctx)
    return { success: true, statusCode: 200, message: 'Designation updated successfully', data: res }
  }

  @Delete('designations/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async deleteDesignation(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.deleteDesignation(id, ctx)
    return { success: true, statusCode: 200, message: 'Designation deleted successfully', data: res }
  }

  // --- Employees ---
  @Post('employees')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async createEmployee(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateEmployeeDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createEmployee(data, ctx)
    return { success: true, statusCode: 201, message: 'Employee created successfully', data: res }
  }

  @Get('employees')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findAllEmployees(
    @RequestContext() ctx: RequestContextDto,
    @Query() query: EmployeeQueryDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllEmployees(ctx, query)
    return { success: true, statusCode: 200, message: 'Employees retrieved successfully', data: res }
  }

  @Get('employees/attendance')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async findEmployeesForAttendance(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllEmployees(ctx, { limit: 100 })
    return {
      success: true,
      statusCode: 200,
      message: 'Employees retrieved successfully for attendance',
      data: res,
    }
  }

  @Get('employees/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findOneEmployee(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findOneEmployee(id, ctx)
    return { success: true, statusCode: 200, message: 'Employee retrieved successfully', data: res }
  }

  @Patch('employees/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async updateEmployee(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateEmployee(id, data, ctx)
    return { success: true, statusCode: 200, message: 'Employee updated successfully', data: res }
  }

  @Post('employees/:id/check-in')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  @Throttle({ transactional: { limit: 10, ttl: 60000 } })
  async checkIn(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: CheckInDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.checkIn(id, body.ip ?? '', ctx, {
      source: body.source,
      deviceId: body.deviceId,
      gpsLat: body.gpsLat,
      gpsLong: body.gpsLong,
      photoUrl: body.photoUrl,
    })
    return { success: true, statusCode: 200, message: 'Check-in successful', data: res }
  }

  @Post('employees/:id/check-out')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  @Throttle({ transactional: { limit: 10, ttl: 60000 } })
  async checkOut(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: Pick<CheckInDto, 'source' | 'deviceId'>,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.checkOut(id, ctx, {
      source: body.source,
      deviceId: body.deviceId,
    })
    return { success: true, statusCode: 200, message: 'Check-out successful', data: res }
  }

  @Get('attendance')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async findAllAttendanceSessions(
    @RequestContext() ctx: RequestContextDto,
    @Query() query: AttendanceQueryDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllAttendanceSessions(ctx, query)
    return {
      success: true,
      statusCode: 200,
      message: 'Attendance sessions retrieved successfully',
      data: res,
    }
  }

  // --- Payroll ---
  @Post('payroll/process')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async processPayroll(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: ProcessPayrollDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.processPayroll(data.period, data.name, ctx)
    return { success: true, statusCode: 200, message: 'Payroll processed successfully', data: res }
  }

  @Post('payroll/batches/:id/approve')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async approvePayrollBatch(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: ApprovePayrollBatchDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.approvePayrollBatch(id, data.approvedById, ctx)
    return { success: true, statusCode: 200, message: 'Payroll batch approved successfully', data: res }
  }

  @Get('payroll/batches')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async findAllPayrollBatches(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllPayrollBatches(ctx)
    return { success: true, statusCode: 200, message: 'Payroll batches retrieved successfully', data: res }
  }

  @Get('payroll/batches/:id/slips')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async findPayrollSlipsByBatch(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findPayrollSlipsByBatch(id, ctx)
    return { success: true, statusCode: 200, message: 'Payroll slips retrieved successfully', data: res }
  }

  @Post('payroll/batches/:id/pay')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async payPayrollBatch(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.payPayrollBatch(id, ctx)
    return { success: true, statusCode: 200, message: 'Payroll batch paid successfully', data: res }
  }

  // --- Shifts ---
  @Post('shifts')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async createShift(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateShiftDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createShift(data, ctx)
    return { success: true, statusCode: 201, message: 'Shift created successfully', data: res }
  }

  @Get('shifts')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async findAllShifts(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllShifts(ctx)
    return { success: true, statusCode: 200, message: 'Shifts retrieved successfully', data: res }
  }

  @Patch('shifts/:id')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async updateShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateShiftDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateShift(id, data, ctx)
    return { success: true, statusCode: 200, message: 'Shift updated successfully', data: res }
  }

  @Delete('shifts/:id')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async deleteShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.deleteShift(id, ctx)
    return { success: true, statusCode: 200, message: 'Shift deleted successfully', data: res }
  }

  @Post('employees/:id/assign-shift')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async assignShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: AssignShiftDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.assignShift(id, data, ctx)
    return { success: true, statusCode: 200, message: 'Shift assigned successfully', data: res }
  }

  @Get('employees/:id/shifts')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async getEmployeeShifts(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findEmployeeShiftAssignments(id, ctx)
    return { success: true, statusCode: 200, message: 'Employee shifts retrieved successfully', data: res }
  }

  // --- Leave Management ---
  @Post('employees/:id/leaves')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async requestLeave(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: RequestLeaveDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.requestLeave(id, data, ctx)
    return { success: true, statusCode: 201, message: 'Leave request submitted', data: res }
  }

  @Get('leaves')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async findAllLeaveRequests(
    @RequestContext() ctx: RequestContextDto,
    @Query() query: LeaveQueryDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllLeaveRequests(ctx, query)
    return { success: true, statusCode: 200, message: 'Leave requests retrieved successfully', data: res }
  }

  @Post('leaves/:id/approve')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async approveLeave(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: ApproveLeaveDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.approveLeave(id, data.approvedById, data.managerNote ?? '', ctx)
    return { success: true, statusCode: 200, message: 'Leave request approved', data: res }
  }

  @Post('leaves/:id/reject')
  @RequirePermissions(SystemPermissions.HRM_ATTENDANCE_CLOCK)
  async rejectLeave(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: RejectLeaveDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.rejectLeave(id, data.rejectedById, data.managerNote ?? '', ctx)
    return { success: true, statusCode: 200, message: 'Leave request rejected', data: res }
  }

  // --- Holidays ---
  @Post('holidays')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async createHoliday(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateHolidayDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createHoliday(data, ctx)
    return { success: true, statusCode: 201, message: 'Holiday created successfully', data: res }
  }

  @Get('holidays')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findAllHolidays(
    @RequestContext() ctx: RequestContextDto,
    @Query('year') year?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllHolidays(ctx, year ? parseInt(year, 10) : undefined)
    return { success: true, statusCode: 200, message: 'Holidays retrieved successfully', data: res }
  }

  @Patch('holidays/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async updateHoliday(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateHolidayDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateHoliday(id, data, ctx)
    return { success: true, statusCode: 200, message: 'Holiday updated successfully', data: res }
  }

  @Delete('holidays/:id')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async deleteHoliday(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.deleteHoliday(id, ctx)
    return { success: true, statusCode: 200, message: 'Holiday deleted successfully', data: res }
  }

  // --- Tax Brackets ---
  @Post('tax-brackets')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async createTaxBracket(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateTaxBracketDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createTaxBracket(data, ctx)
    return { success: true, statusCode: 201, message: 'Tax bracket created successfully', data: res }
  }

  @Get('tax-brackets')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async findAllTaxBrackets(
    @RequestContext() ctx: RequestContextDto,
    @Query('fiscalYear') fiscalYear?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllTaxBrackets(
      ctx,
      fiscalYear ? parseInt(fiscalYear, 10) : undefined,
    )
    return { success: true, statusCode: 200, message: 'Tax brackets retrieved successfully', data: res }
  }

  @Delete('tax-brackets/:id')
  @RequirePermissions(SystemPermissions.HRM_PAYROLL_PROCESS)
  async deleteTaxBracket(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.deleteTaxBracket(id, ctx)
    return { success: true, statusCode: 200, message: 'Tax bracket deleted successfully', data: res }
  }

  // --- Recruitment (ATS) ---
  @Post('jobs')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async createJobPosting(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateJobPostingDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createJobPosting(data, ctx)
    return { success: true, statusCode: 201, message: 'Job posting created', data: res }
  }

  @Get('jobs')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findAllJobPostings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllJobPostings(ctx)
    return { success: true, statusCode: 200, message: 'Job postings retrieved successfully', data: res }
  }

  @Post('applicants')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async applyForJob(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateApplicantDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.applyForJob(data, ctx)
    return { success: true, statusCode: 201, message: 'Application submitted', data: res }
  }

  @Get('applicants')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findAllApplicants(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllApplicants(ctx)
    return { success: true, statusCode: 200, message: 'Applicants retrieved successfully', data: res }
  }

  @Post('interviews')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async scheduleInterview(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: ScheduleInterviewDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.scheduleInterview(data, ctx)
    return { success: true, statusCode: 201, message: 'Interview scheduled', data: res }
  }

  @Get('applicants/:id/interviews')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async findInterviewsByApplicant(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findInterviewsByApplicant(id, ctx)
    return { success: true, statusCode: 200, message: 'Interviews retrieved successfully', data: res }
  }

  @Patch('applicants/:id/status')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async updateApplicantStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateApplicantStatusDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateApplicantStatus(id, data.status, ctx)
    return { success: true, statusCode: 200, message: 'Applicant status updated', data: res }
  }

  @Post('applicants/:id/onboard')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async onboardApplicant(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.onboardApplicant(id, ctx)
    return { success: true, statusCode: 201, message: 'Applicant successfully onboarded as Employee', data: res }
  }

  // --- Performance ---
  @Post('performance/reviews')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async createPerformanceReview(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreatePerformanceReviewDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createPerformanceReview(data, ctx)
    return { success: true, statusCode: 201, message: 'Performance review created', data: res }
  }

  @Get('employees/:id/performance')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async getPerformanceScore(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Query('period') period: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.getEmployeePerformanceScore(id, period, ctx)
    return { success: true, statusCode: 200, message: 'Performance score calculated', data: res }
  }

  @Get('performance/reviews')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async getAllPerformanceReviews(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const res = await this.hrmService.getAllPerformanceReviews(ctx)
    return { success: true, statusCode: 200, message: 'Performance reviews retrieved successfully', data: res }
  }

  @Get('employees/:id/performance/reviews')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async getEmployeePerformanceReviews(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const res = await this.hrmService.getEmployeeReviews(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Employee performance reviews retrieved successfully',
      data: res,
    }
  }

  @Post('seed')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async seedDemoData(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.seedDemoData(ctx)
    return { success: true, statusCode: 201, message: 'Demo data seeded successfully', data: res }
  }

  // --- Employee Documents ---
  @Get('employees/:id/documents')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async getEmployeeDocuments(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const res = await this.hrmService.getEmployeeDocuments(id, ctx)
    return { success: true, statusCode: 200, message: 'Employee documents retrieved', data: res }
  }

  @Post('employees/:id/documents')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async addEmployeeDocument(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: AddEmployeeDocumentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.addEmployeeDocument(id, body, ctx)
    return { success: true, statusCode: 201, message: 'Employee document attached successfully', data: res }
  }

  @Delete('employees/:id/documents/:docId')
  @RequirePermissions(SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async deleteEmployeeDocument(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') _id: string,
    @Param('docId') docId: string,
  ): Promise<BaseApiSuccessResponse<void>> {
    await this.hrmService.deleteEmployeeDocument(docId, ctx)
    return { success: true, statusCode: 200, message: 'Document removed successfully', data: null }
  }
}
