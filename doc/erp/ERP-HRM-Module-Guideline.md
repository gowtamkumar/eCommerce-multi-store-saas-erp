# ERP HRM Module Guideline

The HRM (Human Resource Management) module manages the entire lifecycle of an employee, from recruitment to payroll and performance.

---

## 1. Employee Data Model
*Every staff member is a "User", but not every User is an "Employee" with a salary.*

- **Employee Profile**: Extends the `UserEntity` with professional details.
- **Location Assignment**: Mandatory link to a `Branch` or `Warehouse`.
- **Department**: (e.g., Sales, Logistics, Finance, IT).
- **Designation**: (e.g., Senior Accountant, Warehouse Picker, Branch Manager).
- **Salary Configuration**: Defines Basic Pay, Allowances (Transport, Housing), and Deductions (Tax, Insurance).

---

## 2. Attendance System (Location-Bound)
*Attendance must be verified at the physical location where the work happens.*

1.  **Clock-In/Out**: Staff uses the POS terminal (Branch) or WMS terminal (Warehouse) to punch in.
2.  **Verification**: 
    - **Option A**: Bio-metric integration.
    - **Option B**: IP-address restriction (only allow punch-in from the company network).
    - **Option C**: QR Code scanning at the entrance.
3.  **Overtime Logic**: Automatically calculate extra hours based on the shift schedule.

---

## 3. Leave & Absence Management
1.  **Leave Quota**: Define how many days per year (e.g., 20 days Vacation, 10 days Sick).
2.  **Request Flow**: 
    - Employee requests leave via dashboard.
    - **Manager Approval**: The assigned Branch/Warehouse manager must approve.
3.  **Conflict Check**: System warns if too many people from the same Branch are taking leave on the same day.

---

## 4. Payroll Engine (The Financial Integration)
*This is the most critical part of HRM in an ERP.*

1.  **Salary Computation**: 
    - `Net Salary = (Basic + Overtime + Bonuses) - (Leaves + Taxes + Deductions)`.
2.  **Payroll Batches**: Process salary for all employees in a single click at the end of the month.
3.  **Accounting Action**: On approval, the system creates a `JournalEntry`:
    - **Debit**: Salaries & Wages (Expense Account).
    - **Credit**: Accrued Salaries (Liability) or Cash/Bank (Asset).

---

## 5. Recruitment & Onboarding (Additional Topic)
1.  **Job Postings**: Create internal/external job ads.
2.  **Applicant Tracking**: Store resumes and interview notes.
3.  **Onboarding Checklist**: Automated tasks for new hires (e.g., "Assign to Warehouse B", "Issue ID Card", "Complete Safety Training").

---

## 6. Performance & KPIs
- **Sales KPI**: Automatically linked to the `Order` module (Sales Volume).
- **Warehouse KPI**: Automatically linked to the `Fulfillment` module (Picking Speed).
- **Appraisals**: Yearly/Quarterly reviews stored in the employee profile.

---

## Technical Mapping (Entities)

| Entity | Purpose | Owner |
| :--- | :--- | :--- |
| `employees` | Personal & Contract data. | Global (HR) |
| `attendance` | Time logs, linked to `branch_id`. | Branch/Warehouse |
| `leave_requests` | Vacation tracking and approvals. | Branch/Warehouse |
| `payroll_slips` | Financial record of payment. | Global (Finance) |
| `departments` | Organizational groupings. | Global (Tenant) |

---

## Summary of Implementation Strategy:
1.  **Phase 1**: Expand the `UserEntity` to include `EmployeeProfile` fields.
2.  **Phase 2**: Build the **Attendance** punch-in screen for Branch/Warehouse staff.
3.  **Phase 3**: Implement the **Payroll Batch** logic once the Accounting module is ready.
