import { Body, Controller, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { HrmService } from './hrm.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { CreateDepartmentDto, CreateDesignationDto, CreateEmployeeDto, UpdateEmployeeDto } from './dto/hrm.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { ApplicantStatus } from '@/common/enums/hrm/hrm-enums'

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

  @Post('payroll/process')
  async processPayroll(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: { period: string; name: string },
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called processPayroll for ${data.period}.`)
    const res = await this.hrmService.processPayroll(data.period, data.name, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Payroll processed successfully',
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
}
