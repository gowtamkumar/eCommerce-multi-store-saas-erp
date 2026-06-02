import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { HrmService } from '@/modules/admin/operations/hrm/hrm.service'
import { AccountingService } from '@/modules/admin/operations/finance/accounting/services/accounting.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { EmployeeEntity } from '@/modules/admin/operations/hrm/entities/employee.entity'
import { DepartmentEntity } from '@/modules/admin/operations/hrm/entities/department.entity'
import {
  JobPostingEntity,
  ApplicantEntity,
} from '@/modules/admin/operations/hrm/entities/recruitment.entity'
import { LeaveRequestEntity } from '@/modules/admin/operations/hrm/entities/leave.entity'
import { AttendanceSessionEntity } from '@/modules/admin/operations/hrm/entities/attendance.entity'
import {
  PayrollBatchEntity,
  PayrollSlipEntity,
} from '@/modules/admin/operations/hrm/entities/payroll.entity'
import { JournalEntryEntity } from '@/modules/admin/operations/finance/accounting/entities/journal-entry.entity'
import { UserRole } from '@/common/enums/user/user-role.enum'
import {
  LeaveType,
  LeaveStatus,
  ApplicantStatus,
  EmployeeStatus,
} from '@/common/enums/hrm/hrm-enums'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { v4 as uuidv4 } from 'uuid'

describe('HRM Module (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let hrmService: HrmService
  let accountingService: AccountingService
  let userService: UserService
  let tenant: TenantEntity
  let ctx: RequestContextDto

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    hrmService = app.get(HrmService)
    accountingService = app.get(AccountingService)
    userService = app.get(UserService)

    // Spy on MailService to avoid connection attempts during tests
    const mailService = app.get(MailService)
    jest.spyOn(mailService, 'sendGenericEmail').mockResolvedValue(undefined as any)

    // Create a mock tenant for testing
    const tenantRepo = dataSource.getRepository(TenantEntity)
    tenant = tenantRepo.create({
      storeName: 'E2E Test HRM Store',
      subdomain: `e2e-test-hrm-${Date.now()}`,
    })
    await tenantRepo.save(tenant)

    ctx = new RequestContextDto()
    ctx.tenantId = tenant.id
    ctx.userId = '00000000-0000-0000-0000-000000000000'

    // Initialize Chart of Accounts for this tenant
    await accountingService.initializeTenantCOA(ctx)
  })

  afterAll(async () => {
    if (tenant) {
      try {
        await dataSource.query(`SET session_replication_role = 'replica'`)
      } catch (e) {}

      const tables = [
        'interviews',
        'applicants',
        'job_postings',
        'ledger_entries',
        'journal_entries',
        'payroll_slips',
        'payroll_batches',
        'leave_requests',
        'leave_quotas',
        'attendance_events',
        'attendance_sessions',
        'employee_documents',
        'performance_reviews',
        'employee_shift_assignments',
        'employee_personal_details',
        'employees',
        'designations',
        'departments',
        'shifts',
        'users',
      ]
      for (const table of tables) {
        try {
          await dataSource.query(`DELETE FROM ${table} WHERE tenant_id = $1`, [tenant.id])
        } catch (e) {
          console.error(`Failed to delete from ${table}:`, e)
        }
      }
      const tenantRepo = dataSource.getRepository(TenantEntity)
      try {
        await tenantRepo.delete(tenant.id)
      } catch (e) {
        console.error(`Failed to delete tenant:`, e)
      }

      try {
        await dataSource.query(`SET session_replication_role = 'origin'`)
      } catch (e) {}
    }
    if (app) {
      await app.close()
    }
  })

  describe('Applicant Onboarding', () => {
    it('should onboard an applicant generating a secure random password', async () => {
      const deptRepo = dataSource.getRepository(DepartmentEntity)
      const jobRepo = dataSource.getRepository(JobPostingEntity)
      const appRepo = dataSource.getRepository(ApplicantEntity)

      const dept = await deptRepo.save(
        deptRepo.create({
          name: 'Engineering',
          tenantId: tenant.id,
        }),
      )

      const job: any = await jobRepo.save(
        jobRepo.create({
          title: 'Senior NestJS Developer',
          departmentId: dept.id,
          tenantId: tenant.id,
          status: 'PUBLISHED' as any,
          requirements: ['TypeScript', 'NestJS'],
          description: 'Build backend',
        } as any),
      )

      const applicant = await appRepo.save(
        appRepo.create({
          firstName: 'John',
          lastName: 'Doe',
          email: `john.doe-${Date.now()}@example.com`,
          phone: '1234567890',
          jobPostingId: job.id,
          status: ApplicantStatus.HR_ROUND,
          tenantId: tenant.id,
        }),
      )

      // Spy on userService.createUser to capture the generated password
      const createUserSpy = jest.spyOn(userService, 'createUser')

      const employee = await hrmService.onboardApplicant(applicant.id, ctx)

      expect(employee).toBeDefined()
      expect(employee.status).toBe(EmployeeStatus.PROBATION)

      // Verify that createUser was called with a long, random password
      expect(createUserSpy).toHaveBeenCalled()
      const createUserCallArgs = createUserSpy.mock.calls[createUserSpy.mock.calls.length - 1][0]
      expect(createUserCallArgs.email).toBe(applicant.email)
      expect(createUserCallArgs.password).toBeDefined()
      expect(createUserCallArgs.password.length).toBeGreaterThanOrEqual(32) // 16 bytes hex (32 chars) + 'A1!' -> 35 chars
      expect(createUserCallArgs.password).toMatch(/[A-Z]/)
      expect(createUserCallArgs.password).toMatch(/[0-9]/)
      expect(createUserCallArgs.password).not.toBe('WelcomeEmployee123!')

      // Verify applicant status is JOINED
      const updatedApplicant = await appRepo.findOne({ where: { id: applicant.id } })
      expect(updatedApplicant.status).toBe(ApplicantStatus.JOINED)

      createUserSpy.mockRestore()
    })
  })

  describe('Real Payroll Derivation & GL Accrual Posting', () => {
    it('should calculate pro-rated unpaid leave, unexcused absence, and inactive days deductions and post balanced entries', async () => {
      const userRepo = dataSource.getRepository(UserEntity)
      const empRepo = dataSource.getRepository(EmployeeEntity)
      const leaveRepo = dataSource.getRepository(LeaveRequestEntity)
      const attendanceRepo = dataSource.getRepository(AttendanceSessionEntity)
      const deptRepo = dataSource.getRepository(DepartmentEntity)

      // Clear any employees/users/applicants from previous tests to ensure a clean slate
      await dataSource.query('DELETE FROM employee_personal_details WHERE tenant_id = $1', [
        tenant.id,
      ])
      await dataSource.query('DELETE FROM employees WHERE tenant_id = $1', [tenant.id])
      await dataSource.query('DELETE FROM users WHERE tenant_id = $1', [tenant.id])

      const dept = await deptRepo.save(
        deptRepo.create({
          name: 'IT',
          tenantId: tenant.id,
        }),
      )

      const user = await userRepo.save(
        userRepo.create({
          id: uuidv4(),
          name: 'Jane Smith',
          username: `janesmith-${Date.now()}`,
          password: 'password',
          email: `jane.smith-${Date.now()}@example.com`,
          role: UserRole.EMPLOYEE,
          tenantId: tenant.id,
        }),
      )

      // Jane joins mid-month on May 5th, 2026.
      // Standard salary = 3100. (May 2026 has 31 days, so rate is 100/day).
      // Inactive days: May 1st to May 4th (4 days inactive).
      const employee = await empRepo.save(
        empRepo.create({
          userId: user.id,
          departmentId: dept.id,
          status: EmployeeStatus.ACTIVE,
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          joiningDate: new Date('2026-05-05T00:00:00Z'),
          tenantId: tenant.id,
          salaryConfig: {
            basicSalary: 3100,
            allowances: [{ type: 'HRA', amount: 200 }],
            deductions: [{ type: 'PF', amount: 100 }],
          },
        }),
      )

      // Case A: 1 approved Unpaid leave day on May 12th, 2026
      await leaveRepo.save(
        leaveRepo.create({
          employeeId: employee.id,
          tenantId: tenant.id,
          leaveType: LeaveType.UNPAID,
          startDate: new Date('2026-05-12T00:00:00Z'),
          endDate: new Date('2026-05-12T23:59:59Z'),
          totalDays: 1,
          reason: 'Personal',
          status: LeaveStatus.APPROVED,
        }),
      )

      // Case B: Weekday Attendance Sessions from May 5th to May 31st (excluding May 15th and May 18th)
      // This will result in exactly 2 unexcused absences: May 15th (Friday) and May 18th (Monday).
      // Note: May 9th, 10th, 16th, 17th, 23rd, 24th, 30th, 31st are weekends, so they don't count as absences.
      // May 12th is approved unpaid leave, so it is not an unexcused absence.
      const weekdays = [5, 6, 7, 8, 11, 13, 14, 19, 20, 21, 22, 25, 26, 27, 28, 29]

      for (const day of weekdays) {
        await attendanceRepo.save(
          attendanceRepo.create({
            employeeId: employee.id,
            tenantId: tenant.id,
            checkIn: new Date(`2026-05-${String(day).padStart(2, '0')}T09:00:00Z`),
            checkOut: new Date(`2026-05-${String(day).padStart(2, '0')}T17:00:00Z`),
            workHours: 8,
            overtimeHours: 0,
            lateMinutes: 0,
          }),
        )
      }

      // Process Payroll for period "2026-05"
      const result = await hrmService.processPayroll('2026-05', 'May 2026 Run', ctx)

      expect(result).toBeDefined()
      expect(result.slipCount).toBe(1)

      const slipRepo = dataSource.getRepository(PayrollSlipEntity)
      const slip = await slipRepo.findOne({
        where: { batchId: result.batch.id, employeeId: employee.id },
      })

      expect(slip).toBeDefined()
      const details = slip.details as any
      // Standard Basic = 3100
      // Inactive days = 4 (May 1, 2, 3, 4) -> 400 deduction
      // Unpaid leave = 1 (May 12) -> 100 deduction
      // Unexcused absence = 2 (May 15, 18) -> 200 deduction
      // Total unpaid deductions = 400 + 100 + 200 = 700
      expect(details.inactiveDays).toBe(4)
      expect(details.unpaidLeaveDays).toBe(1)
      expect(details.unpaidAbsenceDays).toBe(2)

      expect(Number(details.inactiveDeductions)).toBeCloseTo(400, 1)
      expect(Number(details.unpaidLeaveDeductions)).toBeCloseTo(100, 1)
      expect(Number(details.unpaidAbsenceDeductions)).toBeCloseTo(200, 1)
      expect(Number(details.leaveDeductions)).toBeCloseTo(700, 1) // sum

      // Gross = basic (3100) + allowances (200) + overtime (0) = 3300
      // Deductions = base (100) + late (0) + tax + leaveDeductions (700)
      // Income Tax on 3300 = 75 + (3300 - 3000) * 0.10 = 105
      // Total Deductions = 100 PF + 105 Tax + 700 Leave/Absence/Inactive = 905
      // Net Salary = 3300 - 905 = 2395
      expect(Number(slip.netSalary)).toBeCloseTo(2395, 1)

      // Approve the payroll batch so that the GL journal entry is posted
      await hrmService.approvePayrollBatch(result.batch.id, employee.id, ctx)

      // Verify general ledger journal entry is posted and balanced
      const journalRepo = dataSource.getRepository(JournalEntryEntity)
      const entry = await journalRepo.findOne({
        where: { referenceId: result.batch.id, referenceType: 'PAYROLL_BATCH' },
        relations: ['lines', 'lines.account'],
      })

      expect(entry).toBeDefined()
      // Total amount should equal debit total
      // Debits: Salaries Expense (6000) = Gross (3300) - Leave Deductions (700) = 2600
      // Credits:
      // - Salaries Payable (2100) = 2395
      // - Payroll Tax Liabilities (2200) = 105
      // - Accounts Payable (2100) = 100 (PF)
      // Total debits = 2600. Total credits = 2395 + 105 + 100 = 2600.
      expect(Number(entry.totalAmount)).toBeCloseTo(2600, 1)

      const debitLine = entry.lines.find((l) => l.account?.code === '6000')
      expect(Number(debitLine.amount)).toBeCloseTo(2600, 1)

      // Test Pay Payroll Batch
      const paidBatch = await hrmService.payPayrollBatch(result.batch.id, ctx)
      expect(paidBatch.status).toBe('PAID')

      // Verify payment settlement journal entry is posted
      const payEntry = await journalRepo.findOne({
        where: { referenceId: result.batch.id, referenceType: 'PAYROLL_PAYMENT' },
        relations: ['lines'],
      })
      expect(payEntry).toBeDefined()
      expect(Number(payEntry.totalAmount)).toBeCloseTo(2395, 1)
    })
  })
})
