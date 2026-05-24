# ERP User Manual — Human Resources & Payroll (HR Manager / Payroll Officer)

**Document Version:** 1.0.0  
**Audience:** HR Managers, Payroll Officers, Recruitment Coordinators  
**Last Updated:** May 24, 2026  

---

## Overview
This manual covers all Human Resource Management (HRM) operations — from onboarding new employees, managing attendance and leave requests, to processing the monthly payroll. The HRM system is deeply integrated with the Financial Accounting module: every approved payroll batch automatically posts a balanced journal entry to the General Ledger.

---

## Module 1: Employee Onboarding & Records

### 1.1 Creating a New Employee Record

Every new hire requires a **2-step onboarding process**: (1) creating a system User account, then (2) linking that account to an Employee profile.

**Step 1 — Invite the staff user (if not already done):**
1.  Go to **HRM → Staff → Invite New Member**
2.  Enter their email and assign a base role (e.g., `Sales Associate`)
3.  Click **Send Invitation** — they receive a link to set their password

**Step 2 — Create the Employee Profile:**
1.  Go to **HRM → Employees → Create Employee**
2.  Select the linked user account from the dropdown
3.  Fill in the **Work Details** tab:
    - Department (e.g., `Sales`, `Warehouse`)
    - Designation / Job Title (e.g., `Senior Cashier`)
    - Branch Assignment
    - Contract Type: `PERMANENT`, `CONTRACT`, or `PROBATIONARY`
    - Contract Start Date & End Date (for contract employees)
    - Reporting Manager
4.  Fill in the **Personal Details** tab:
    - Date of Birth, NID number, Blood Group
    - Emergency Contact Name, Relationship, Phone
    - Permanent Address
5.  Fill in the **Payroll Settings** tab:
    - Basic Salary (monthly)
    - Allowances: Add rows for `House Rent`, `Transport`, `Medical` etc. with amounts
    - Deductions: Add rows for `Provident Fund`, `Tax` etc.
6.  Click **Save Employee**

### 1.2 Uploading Employee Documents
The employee profile includes a secure **Document Vault** for legal and compliance files.

1.  Go to **HRM → Employees → [Employee Name] → Documents Tab**
2.  Click **Upload Document**
3.  Select the document type: `Employment Contract`, `NID Copy`, `Education Certificate`, `Offer Letter`
4.  Upload the file (PDF/JPG, max 10MB)
5.  Documents can be viewed or deleted at any time

### 1.3 Departments & Designations
To organize employees by organizational structure:
1.  Go to **HRM → Departments → Add Department** (e.g., `Finance`, `Operations`)
2.  Go to **HRM → Designations → Add Designation** (e.g., `Branch Manager`, `Junior Accountant`)
3.  Assign employees to their correct Department and Designation in the Employee Profile

---

## Module 2: Attendance Management

### 2.1 How Employees Clock In and Out
Employees record attendance via the **Employee Self-Service Panel** at `yourstore.com/admin/hrm/attendance`:
- **Clock In:** Click the **Punch In** button when starting work
- **Clock Out:** Click the **Punch Out** button when ending the day
- Each punch is logged as an `attendance_event` with an exact timestamp

Supported methods (based on setup):
- **Browser-Based Punch:** Standard click-based check-in
- **QR Code Scan:** Employee scans a printed QR code posted at the office entrance
- **GPS Geofencing:** Mobile-based punch auto-validated against office GPS coordinates

### 2.2 Reviewing Daily Attendance
1.  Go to **HRM → Attendance → Daily View**
2.  Select a date and branch
3.  The table shows each employee's status:
    - ✅ **Present** — clocked in and out within shift hours
    - 🟡 **Late Arrival** — clocked in after the scheduled start time
    - ❌ **Absent** — no attendance record for the day
    - 🔵 **On Leave** — covered by an approved leave request

### 2.3 Correcting an Attendance Record
If an employee forgot to punch or punched at the wrong time:
> Attendance records cannot be deleted. You create a **correction record** with a reason and approver ID.

1.  Go to **HRM → Attendance → [Employee] → Corrections**
2.  Click **Add Correction**
3.  Select the date, corrected punch time, correction type (`ADD_PUNCH_IN`, `ADD_PUNCH_OUT`, `EDIT_PUNCH`)
4.  Enter the correction reason and click **Submit** — this is logged in the audit trail

---

## Module 3: Leave Management

### 3.1 Leave Types
The system supports the following leave categories (configurable per company policy):

| Leave Type | Description |
| :--- | :--- |
| **ANNUAL** | Paid annual/earned leave |
| **SICK** | Medical leave (may require certificate) |
| **CASUAL** | Short casual leave for personal reasons |
| **MATERNITY** | Extended maternity leave |
| **PATERNITY** | Paternity leave |
| **UNPAID** | Leave without pay |

### 3.2 Setting Annual Leave Quotas
At the start of each year, HR must allocate leave quotas per employee:
1.  Go to **HRM → Leave → Quotas → Set Annual Quota**
2.  Select Year (e.g., `2026`)
3.  For each employee, set the number of days per leave type:
    - Annual: `20 days`
    - Sick: `10 days`
    - Casual: `5 days`
4.  Click **Save Quotas**
5.  Alternatively, click **Bulk Set** to apply the same quota to all employees in a department

### 3.3 Approving a Leave Request
When an employee submits a leave request:
1.  Go to **HRM → Leave → Pending Requests**
2.  Click on the request to review:
    - Employee name, leave type, dates, total days
    - Reason provided by the employee
    - Current leave balance for that type
3.  Options:
    - Click **Approve** and optionally add a manager note
    - Click **Reject** and enter a rejection reason (mandatory)
4.  The employee is notified immediately via system notification
5.  If approved, the `leave_quotas.usedDays` is automatically incremented

### 3.4 Leave Impact on Payroll
- **Unpaid leave** days are automatically deducted from that month's payroll calculation
- **Approved paid leave** (Annual/Sick/Casual) is counted as regular work days — no salary deduction
- The payroll slip `details.leaveDeductions` field shows exactly how many unpaid days were deducted

---

## Module 4: Payroll Processing

### 4.1 Understanding Payroll Components
Each employee's payroll slip is calculated from:

| Component | Calculation |
| :--- | :--- |
| **Basic Salary** | Fixed monthly base salary |
| **Allowances** | House rent, transport, medical (configured per employee) |
| **Overtime Pay** | Overtime hours × overtime rate per hour |
| **Late Deductions** | Late arrival minutes × per-minute penalty rate |
| **Unpaid Leave Deductions** | (Basic Salary ÷ working days) × unpaid leave days |
| **Income Tax** | Applied based on annual salary tax slab configuration |
| **Net Salary** | Basic + Allowances + Overtime − Deductions − Tax |

### 4.2 Processing the Monthly Payroll Batch

**Step 1 — Generate the Batch:**
1.  Go to **HRM → Payroll → Create Batch**
2.  Enter the **Period** (e.g., `May 2026`) and a descriptive **Batch Name**
3.  Click **Generate Payroll Slips** — the system automatically:
    - Aggregates each employee's attendance sessions for the selected month
    - Calculates overtime hours above the standard shift schedule
    - Sums approved unpaid leave days
    - Computes late arrival deductions
    - Applies income tax withholding

**Step 2 — Review Individual Payroll Slips:**
1.  The batch is created in `DRAFT` status
2.  Click **View Slips** to see each employee's breakdown
3.  Verify the calculations are correct. Common checks:
    - Are overtime hours correct for staff who worked late?
    - Are leave deductions accurate for staff who took unpaid days?
    - Is the tax withholding correct for senior staff?

**Step 3 — Approve the Batch:**
1.  If everything is correct, click **Approve Batch**
2.  The batch status changes to `APPROVED`
3.  The system **automatically posts** a balanced double-entry journal entry:
    - `DEBIT Salary Expense (5100)` — the total net salary amount
    - `CREDIT Salary Payable (2200)` — recording the payroll liability

**Step 4 — Release Salary Payments:**
1.  After bank transfers are made to employees, record the payment:
2.  Go to **HRM → Payroll → [Batch] → Release Payment**
3.  Enter the bank transfer reference number and payment date
4.  Click **Mark as Paid** — this posts the final clearing entry:
    - `DEBIT Salary Payable (2200)` — clearing the liability
    - `CREDIT Cash at Bank (1000)` — recording cash outflow

### 4.3 Generating Payslips for Employees
Individual employees can view their own payslips from the Employee Self-Service portal.

As HR, to print or share a payslip:
1.  Go to **HRM → Payroll → [Batch] → View Slips → [Employee Name]**
2.  Click **Download PDF** or **Print Payslip**
3.  The payslip includes all salary components, deductions, and the net amount

---

## Module 5: Recruitment (Hiring Pipeline)

### 5.1 Creating a Job Opening
1.  Go to **HRM → Recruitment → Job Openings → Add Opening**
2.  Enter:
    - Job Title, Department, Branch
    - Required Skills, Minimum Experience
    - Application Deadline
3.  Set Status to **Open**
4.  Click **Save**

### 5.2 Managing the Candidate Pipeline
Candidates progress through stages:

```
Applied → Screening → Interview Scheduled → Interview Done → Offer Sent → Hired / Rejected
```

1.  Go to **HRM → Recruitment → [Job Opening] → Candidates**
2.  Click a candidate to update their stage
3.  Add interviewer notes at each stage
4.  When the decision is made:
    - **Hired:** Click **Convert to Employee** — this pre-fills the Employee Onboarding form with the candidate's data
    - **Rejected:** Click **Mark as Rejected** with reason

---

## Quick Reference Cheatsheet

| Task | Navigation |
| :--- | :--- |
| Create new employee profile | HRM → Employees → Create Employee |
| Upload employee document | HRM → Employees → [Employee] → Documents → Upload |
| View today's attendance | HRM → Attendance → Daily View |
| Correct a missed punch | HRM → Attendance → [Employee] → Corrections → Add Correction |
| Set annual leave quota | HRM → Leave → Quotas → Set Annual Quota |
| Approve a leave request | HRM → Leave → Pending Requests → [Request] → Approve |
| Generate payroll batch | HRM → Payroll → Create Batch → Generate Slips |
| Approve payroll batch | HRM → Payroll → [Batch] → Approve Batch |
| Release salary payment | HRM → Payroll → [Batch] → Release Payment |
| Download employee payslip | HRM → Payroll → [Batch] → [Employee] → Download PDF |
| Add job opening | HRM → Recruitment → Job Openings → Add Opening |

---

## Common Errors & Solutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| Payroll slip shows zero overtime | Employee shift schedule not set | Go to HRM → Employees → [Employee] → Set Shift Schedule |
| Leave deductions not appearing | Leave type was approved as Paid | Verify leave type — only Unpaid leave creates salary deductions |
| Cannot approve payroll batch | Batch has slips with invalid net salary (negative) | Review individual slips — check for excessive deductions |
| Employee shows as Absent despite punch records | Punch-in and punch-out records exist but as separate unclosed events | Add a correction to close the attendance session |
