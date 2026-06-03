import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'
import { DepartmentEntity } from './entities/department.entity'
import { DesignationEntity } from './entities/designation.entity'
import { EmployeeEntity } from './entities/employee.entity'
import { EmployeePersonalDetailsEntity } from './entities/employee-personal-details.entity'
import { EmployeeDocumentEntity } from './entities/employee-document.entity'
import { EmployeeIdSequenceEntity } from './entities/employee-id-sequence.entity'
import { ShiftEntity, EmployeeShiftAssignmentEntity } from './entities/shift.entity'
import { AttendanceEventEntity } from './entities/attendance-event.entity'
import { AttendanceSessionEntity } from './entities/attendance.entity'
import { LeaveRequestEntity, LeaveQuotaEntity } from './entities/leave.entity'
import { PayrollBatchEntity, PayrollSlipEntity } from './entities/payroll.entity'
import { JobPostingEntity, ApplicantEntity, InterviewEntity } from './entities/recruitment.entity'
import { PerformanceReviewEntity } from './entities/performance.entity'
import { HolidayEntity } from './entities/holiday.entity'
import { TaxBracketEntity } from './entities/tax-bracket.entity'
import { HrmService } from './hrm.service'
import { HrmController } from './hrm.controller'
import { HrmRepository } from './hrm.repository'
import { HrmSchedulerProcessor } from './queue/hrm-scheduler.processor'
import { HrmSchedulerService } from './queue/hrm-scheduler.service'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [
    AuditLogModule,
    UserModule,
    NotificationModule,
    BullModule.registerQueue({ name: 'hrm' }),
    BullModule.registerQueue({ name: 'accounting' }),
    TypeOrmModule.forFeature([
      DepartmentEntity,
      DesignationEntity,
      EmployeeEntity,
      EmployeePersonalDetailsEntity,
      EmployeeDocumentEntity,
      EmployeeIdSequenceEntity,
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
      HolidayEntity,
      TaxBracketEntity,
    ]),
  ],
  controllers: [HrmController],
  providers: [HrmService, HrmRepository, HrmSchedulerProcessor, HrmSchedulerService],
  exports: [HrmService],
})
export class HrmModule {}
