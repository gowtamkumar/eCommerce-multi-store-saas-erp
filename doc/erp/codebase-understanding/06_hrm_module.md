# Codebase Understanding — Human Resource Management (HRM) Module

This document details the codebase design for the full HRM lifecycle: departments, designations, employee records, attendance, leave, payroll batch processing, performance reviews, and recruitment pipelines.

---

## Module Location

```
server/src/modules/admin/operations/hrm/
├── entities/                         # All HRM database entities
│   ├── employee.entity.ts            # Core employee profile
│   ├── employee-personal-details.entity.ts
│   ├── employee-document.entity.ts
│   ├── department.entity.ts
│   ├── designation.entity.ts
│   ├── shift.entity.ts               # Work shift schedules
│   ├── attendance.entity.ts          # Daily attendance summaries
│   ├── attendance-event.entity.ts    # Raw punch-in/out events
│   ├── leave.entity.ts               # Leave quotas and requests
│   ├── payroll.entity.ts             # Payroll batches and slips
│   ├── performance.entity.ts         # Performance reviews
│   └── recruitment.entity.ts         # Recruitment pipeline
├── hrm.service.ts                    # Core business logic (~42KB)
├── hrm.controller.ts                 # All HRM REST endpoints (~24KB)
├── hrm.repository.ts                 # Scoped database access layer (~14KB)
└── hrm.module.ts                     # NestJS module wiring
```

---

## 1. Database Entity Map

### 1.1 Organizational Structure
*   **`DepartmentEntity` (`entities/department.entity.ts`):**
    Logical groupings for employees (e.g. Sales, Operations, Finance). Scoped by `tenantId`. Simple structure: `name`, `description`.

*   **`DesignationEntity` (`entities/designation.entity.ts`):**
    Job titles within departments (e.g. Senior Accountant, Branch Manager). Linked to `DepartmentEntity` via FK.

### 1.2 Employee Profile
*   **`EmployeeEntity` (`entities/employee.entity.ts`):**
    Core employee record. Contains:
    - `userId` — FK linking to the staff `UserEntity` (authentication account)
    - `employeeCode` — Unique code per tenant (e.g. `EMP-001`)
    - `departmentId`, `designationId` — Org tree placement
    - `branchId` — Primary branch assignment
    - `joiningDate`, `confirmationDate`
    - `salaryBasic`, `salaryAllowances`, `salaryDeductions` — Payroll computation inputs
    - `status` (ACTIVE, RESIGNED, TERMINATED)

*   **`EmployeePersonalDetailsEntity` (`entities/employee-personal-details.entity.ts`):**
    Sensitive PII stored separately for access-control isolation. Contains NID number, emergency contact, address, date of birth.

*   **`EmployeeDocumentEntity` (`entities/employee-document.entity.ts`):**
    Document vault (NID scan, offer letter, certificate uploads). Fields: `documentType`, `fileUrl`, `uploadedAt`.

### 1.3 Attendance
*   **`AttendanceEventEntity` (`entities/attendance-event.entity.ts`):**
    Raw GPS or biometric punch records. Stores `employeeId`, `punchTime`, `type` (PUNCH_IN, PUNCH_OUT), `deviceId`, `latitude`, `longitude`.

*   **`AttendanceEntity` (`entities/attendance.entity.ts`):**
    Derived daily attendance summary. Computed from raw punch events. Stores `workDate`, `checkInTime`, `checkOutTime`, `workMinutes`, `status` (PRESENT, ABSENT, HALF_DAY, LATE).

*   **`ShiftEntity` (`entities/shift.entity.ts`):**
    Defines scheduled work windows per department or individual (e.g. 09:00–18:00, Night Shift 22:00–06:00).

### 1.4 Leave Management
*   **`LeaveEntity` (`entities/leave.entity.ts`):**
    Dual purpose — stores both quota allocations and requests:
    - `type` field differentiates `QUOTA` vs `REQUEST` records
    - `leaveType` (ANNUAL, SICK, CASUAL, MATERNITY, UNPAID)
    - `startDate`, `endDate`, `totalDays`
    - `status` (PENDING, APPROVED, REJECTED, CANCELLED)
    - `approvedBy`, `approvedAt` — Approval audit trail

### 1.5 Payroll
*   **`PayrollEntity` (`entities/payroll.entity.ts`):**
    Dual purpose — stores both batch headers and individual payslips:
    - Batch: `billingMonth`, `status` (DRAFT, APPROVED, PAID), `journalEntryId` (links to the auto-posted GL entry)
    - Slip: `employeeId`, `basicSalary`, `overtimePay`, `deductions`, `netPay`, `paymentStatus`

### 1.6 Recruitment
*   **`RecruitmentEntity` (`entities/recruitment.entity.ts`):**
    Manages the full hiring pipeline:
    - `jobTitle`, `department`, `openPositions`
    - Applicant records with CV URL, interview notes, interview date
    - `status` (APPLIED, SCREENING, INTERVIEW, OFFERED, HIRED, REJECTED)

### 1.7 Performance Reviews
*   **`PerformanceEntity` (`entities/performance.entity.ts`):**
    Stores periodic employee appraisals. Fields: `reviewPeriod`, `reviewerId`, `rating`, `comments`, `goalsAchieved`.

---

## 2. Service Layer (`hrm.service.ts`)

The monolithic HRM service (~42KB) orchestrates all HR workflows:

| Method | Responsibility |
| :--- | :--- |
| `createEmployee()` | Onboard a new hire, create user account link, seed leave quotas |
| `punchAttendance()` | Record a raw punch event and recompute daily attendance summary |
| `computeAttendanceSummary()` | Aggregate punch pairs into work-minutes and attendance status |
| `applyLeave()` | Submit a leave request against available quota |
| `approveLeave()` | Manager approves and deducts from the employee's quota balance |
| `processPayrollBatch()` | Compute net pay for all employees in a billing month using attendance data |
| `approvePayroll()` | Lock batch → post journal (DR: Salary Expense / CR: Salary Payable) |
| `releasePayroll()` | Mark slips as paid → post settlement journal (DR: Salary Payable / CR: Cash) |
| `createRecruitment()` | Open a job posting and begin tracking applicants |
| `updateApplicantStatus()` | Move applicant through the pipeline stages |
| `createPerformanceReview()` | Record appraisal ratings and manager comments |

---

## 3. GL Integration Pattern

The payroll-to-accounting integration is the most critical HRM financial flow:

```
approvePayroll(batchId)
  │
  ├─ Lock PayrollBatch status = APPROVED
  │
  └─ Emit event: 'payroll.batch.approved'
        │
        └─ AccountingIntegrationService listens
              │
              ├─ Create JournalEntry
              │   ├─ DEBIT:  Salary Expense Account (6100)   = totalGross
              │   └─ CREDIT: Salary Payable Account (2200)   = totalGross
              │
              └─ Save journalEntryId back to PayrollBatch.journalEntryId
                 (Idempotency key: 'payroll:{batchId}:journal')
```

---

## 4. Key API Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/hrm/employees` | Create new employee record |
| `GET` | `/api/admin/hrm/employees/:id` | Get full employee profile |
| `POST` | `/api/admin/hrm/attendance/punch` | Record a punch-in or punch-out event |
| `GET` | `/api/admin/hrm/attendance` | Query attendance by date range / employee |
| `POST` | `/api/admin/hrm/leave/apply` | Submit a leave application |
| `PATCH` | `/api/admin/hrm/leave/:id/approve` | Approve or reject a leave request |
| `POST` | `/api/admin/hrm/payroll/process` | Generate payroll batch for a billing month |
| `PATCH` | `/api/admin/hrm/payroll/:id/approve` | Approve payroll batch and post GL |
| `PATCH` | `/api/admin/hrm/payroll/:id/release` | Mark batch as paid and settle GL |
| `GET` | `/api/admin/hrm/payroll/slips/:employeeId` | Retrieve employee payslip history |
| `POST` | `/api/admin/hrm/recruitment` | Create a job posting |
| `PATCH` | `/api/admin/hrm/recruitment/:id/applicants/:appId` | Move applicant stage |
