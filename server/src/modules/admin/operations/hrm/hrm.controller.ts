import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ApplicantStatus } from '@/common/enums/hrm/hrm-enums'
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
import {
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateShiftDto,
  AssignShiftDto,
} from './dto/hrm.dto'
import { HrmService } from './hrm.service'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/hrm')
@Controller('operations/hrm')
export class HrmController {
  private readonly logger = new Logger(HrmController.name)

  constructor(private readonly hrmService: HrmService) { }

  @Post('departments')
  async createDepartment(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateDepartmentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createDepartment.`)
    const res = await this.hrmService.createDepartment(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Department created successfully',
      data: res,
    }
  }

  @Get('departments')
  async findAllDepartments(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllDepartments.`)
    const res = await this.hrmService.findAllDepartments(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Departments retrieved successfully',
      data: res,
    }
  }

  @Patch('departments/:id')
  async updateDepartment(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateDepartment.`)
    const res = await this.hrmService.updateDepartment(id, data, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Department updated successfully',
      data: res,
    }
  }

  @Delete('departments/:id')
  async deleteDepartment(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called deleteDepartment.`)
    const res = await this.hrmService.deleteDepartment(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Department deleted successfully',
      data: res,
    }
  }

  @Post('designations')
  async createDesignation(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateDesignationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createDesignation.`)
    const res = await this.hrmService.createDesignation(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Designation created successfully',
      data: res,
    }
  }

  @Get('designations')
  async findAllDesignations(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllDesignations.`)
    const res = await this.hrmService.findAllDesignations(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Designations retrieved successfully',
      data: res,
    }
  }

  @Patch('designations/:id')
  async updateDesignation(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateDesignation.`)
    const res = await this.hrmService.updateDesignation(id, data, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Designation updated successfully',
      data: res,
    }
  }

  @Delete('designations/:id')
  async deleteDesignation(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called deleteDesignation.`)
    const res = await this.hrmService.deleteDesignation(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Designation deleted successfully',
      data: res,
    }
  }

  @Post('employees')
  async createEmployee(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateEmployeeDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createEmployee.`)
    const res = await this.hrmService.createEmployee(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Employee created successfully',
      data: res,
    }
  }

  @Get('employees')
  async findAllEmployees(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllEmployees.`)
    const res = await this.hrmService.findAllEmployees(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Employees retrieved successfully',
      data: res,
    }
  }

  @Get('employees/:id')
  async findOneEmployee(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneEmployee.`)
    const res = await this.hrmService.findOneEmployee(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Employee retrieved successfully',
      data: res,
    }
  }

  @Patch('employees/:id')
  async updateEmployee(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateEmployee.`)
    const res = await this.hrmService.updateEmployee(id, data, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Employee updated successfully',
      data: res,
    }
  }

  @Post('employees/:id/clock-in')
  async clockIn(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('ip') ip: string, // In production, we'd use @Ip() but allowing manual for testing
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called clockIn for ${id}.`)
    const res = await this.hrmService.clockIn(id, ip, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Clock-in successful',
      data: res,
    }
  }

  @Post('employees/:id/clock-out')
  async clockOut(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called clockOut for ${id}.`)
    const res = await this.hrmService.clockOut(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Clock-out successful',
      data: res,
    }
  }

  @Get('attendance')
  async findAllAttendanceSessions(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllAttendanceSessions.`)
    const res = await this.hrmService.findAllAttendanceSessions(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Attendance sessions retrieved successfully',
      data: res,
    }
  }

  @Post('payroll/process')
  async processPayroll(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: { period: string; name: string },
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called processPayroll for ${data.period}.`,
    )
    const res = await this.hrmService.processPayroll(data.period, data.name, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Payroll processed successfully',
      data: res,
    }
  }

  @Get('payroll/batches')
  async findAllPayrollBatches(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPayrollBatches.`)
    const res = await this.hrmService.findAllPayrollBatches(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Payroll batches retrieved successfully',
      data: res,
    }
  }

  @Get('payroll/batches/:id/slips')
  async findPayrollSlipsByBatch(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findPayrollSlipsByBatch for ${id}.`)
    const res = await this.hrmService.findPayrollSlipsByBatch(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Payroll slips retrieved successfully',
      data: res,
    }
  }

  // --- Shift Management ---
  @Post('shifts')
  async createShift(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: CreateShiftDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createShift.`)
    const res = await this.hrmService.createShift(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Shift created successfully',
      data: res,
    }
  }

  @Get('shifts')
  async findAllShifts(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllShifts.`)
    const res = await this.hrmService.findAllShifts(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shifts retrieved successfully',
      data: res,
    }
  }

  @Patch('shifts/:id')
  async updateShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateShift.`)
    const res = await this.hrmService.updateShift(id, data, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shift updated successfully',
      data: res,
    }
  }

  @Delete('shifts/:id')
  async deleteShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called deleteShift.`)
    const res = await this.hrmService.deleteShift(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shift deleted successfully',
      data: res,
    }
  }

  @Post('employees/:id/assign-shift')
  async assignShift(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: AssignShiftDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called assignShift for employee ${id}.`,
    )
    const res = await this.hrmService.assignShift(id, data, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shift assigned successfully',
      data: res,
    }
  }

  @Get('employees/:id/shifts')
  async getEmployeeShifts(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getEmployeeShifts for ${id}.`)
    const res = await this.hrmService.findEmployeeShiftAssignments(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Employee shifts retrieved successfully',
      data: res,
    }
  }

  // --- Leave Management ---
  @Post('employees/:id/leaves')
  async requestLeave(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called requestLeave for employee ${id}.`,
    )
    const res = await this.hrmService.requestLeave(id, data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Leave request submitted',
      data: res,
    }
  }

  @Get('leaves')
  async findAllLeaveRequests(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllLeaveRequests.`)
    const res = await this.hrmService.findAllLeaveRequests(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Leave requests retrieved successfully',
      data: res,
    }
  }

  @Post('leaves/:id/approve')
  async approveLeave(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('approvedById') approvedById: string,
    @Body('managerNote') managerNote: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called approveLeave for request ${id}.`,
    )
    const res = await this.hrmService.approveLeave(id, approvedById, managerNote, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Leave request approved',
      data: res,
    }
  }

  // --- Recruitment (ATS) ---
  @Post('jobs')
  async createJobPosting(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createJobPosting(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Job posting created',
      data: res,
    }
  }

  @Get('jobs')
  async findAllJobPostings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllJobPostings(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Job postings retrieved successfully',
      data: res,
    }
  }

  @Post('applicants')
  async applyForJob(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.applyForJob(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Application submitted',
      data: res,
    }
  }

  @Get('applicants')
  async findAllApplicants(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findAllApplicants(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Applicants retrieved successfully',
      data: res,
    }
  }

  @Post('interviews')
  async scheduleInterview(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.scheduleInterview(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Interview scheduled',
      data: res,
    }
  }

  @Get('applicants/:id/interviews')
  async findInterviewsByApplicant(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.findInterviewsByApplicant(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Interviews retrieved successfully',
      data: res,
    }
  }

  @Patch('applicants/:id/status')
  async updateApplicantStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: ApplicantStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.updateApplicantStatus(id, status, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Applicant status updated',
      data: res,
    }
  }

  // --- Performance & KPIs ---
  @Post('performance/reviews')
  async createPerformanceReview(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.createPerformanceReview(data, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Performance review created',
      data: res,
    }
  }

  @Get('employees/:id/performance')
  async getPerformanceScore(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Query('period') period: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.getEmployeePerformanceScore(id, period, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Performance score calculated',
      data: res,
    }
  }

  @Post('seed')
  async seedDemoData(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const res = await this.hrmService.seedDemoData(ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Demo data seeded successfully',
      data: res,
    }
  }
}
