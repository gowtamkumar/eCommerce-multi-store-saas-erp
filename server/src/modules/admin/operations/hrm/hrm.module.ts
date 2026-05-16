import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DepartmentEntity } from './entities/department.entity'
import { DesignationEntity } from './entities/designation.entity'
import { EmployeeEntity } from './entities/employee.entity'
import { EmployeePersonalDetailsEntity } from './entities/employee-personal-details.entity'
import { EmployeeDocumentEntity } from './entities/employee-document.entity'
import { ShiftEntity, EmployeeShiftAssignmentEntity } from './entities/shift.entity'
import { AttendanceEventEntity } from './entities/attendance-event.entity'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { LeaveRequestEntity, LeaveQuotaEntity } from './entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from './entities/payroll.entity'
import { JobPostingEntity, ApplicantEntity, InterviewEntity } from './entities/recruitment.entity'
import { PerformanceReviewEntity } from './entities/performance.entity'
import { HrmService } from './hrm.service'
import { HrmController } from './hrm.controller'
import { HrmRepository } from './hrm.repository'
import { AccountingModule } from '@/modules/admin/operations/finance/accounting/accounting.module'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { UserModule } from '@/modules/admin/core/user/user.module'

@Module({
  imports: [
    AccountingModule,
    AuditLogModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      DepartmentEntity,
      DesignationEntity,
      EmployeeEntity,
      EmployeePersonalDetailsEntity,
      EmployeeDocumentEntity,
      ShiftEntity,
      EmployeeShiftAssignmentEntity,
      AttendanceEventEntity,
      AttendanceSessionEntity,
      LeaveRequestEntity,
      LeaveQuotaEntity,
      PayrollBatchEntity,
      PayrollSlipEntity,
      JobPostingEntity,
      ApplicantEntity,
      InterviewEntity,
      PerformanceReviewEntity,
    ]),
  ],
  controllers: [HrmController],
  providers: [HrmService, HrmRepository],
  exports: [HrmService],
})
export class HrmModule { }
