import type { PayrollBatch, PayrollSlip } from "../hooks/usePayrollManager";

export interface PayrollSlipDetails {
  allowances?: Array<{ type: string; amount: number }>;
  deductions?: Array<{ type: string; amount: number }>;
  overtimePay?: number;
  leaveDeductions?: number;
  lateDeductions?: number;
  incomeTax?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  unpaidLeaveDays?: number;
  unpaidAbsenceDays?: number;
  inactiveDays?: number;
  holidayDays?: number;
  weeklyOffDays?: number;
  activeDays?: number;
  workingDays?: number;
  unpaidLeaveDeductions?: number;
  unpaidAbsenceDeductions?: number;
  inactiveDeductions?: number;
}

function formatAmount(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "0.00";
  return Number(value).toFixed(2);
}

function getEmployeeFirstName(fullName?: string): string {
  if (!fullName?.trim()) return "Team member";
  return fullName.trim().split(/\s+/)[0] || "Team member";
}

function appendLine(lines: string[], label: string, amount: number | undefined | null) {
  if (amount === undefined || amount === null || Number(amount) === 0) return;
  lines.push(`- ${label}: ${formatAmount(amount)}`);
}

export function buildPayslipExplanationSummary(
  batch: PayrollBatch,
  slip: PayrollSlip & { details?: PayrollSlipDetails },
): string {
  const details = slip.details || {};
  const lines = [
    "Context: employee payslip explanation (template fill from payroll DB)",
    `Payroll batch: ${batch.name}`,
    `Pay period: ${batch.period}`,
    `Employee first name (for greeting only): ${getEmployeeFirstName(slip.employee?.user?.name)}`,
    slip.employee?.department?.name ? `Department: ${slip.employee.department.name}` : null,
    slip.employee?.designation?.name ? `Role: ${slip.employee.designation.name}` : null,
    "",
    "Payslip totals:",
    `- Basic salary: ${formatAmount(slip.basicSalary)}`,
    `- Total allowances: ${formatAmount(slip.totalAllowances)}`,
    `- Total deductions: ${formatAmount(slip.totalDeductions)}`,
    `- Net pay: ${formatAmount(slip.netSalary)}`,
  ].filter(Boolean) as string[];

  const componentLines: string[] = ["", "Earnings and deduction components:"];
  appendLine(componentLines, "Overtime pay", details.overtimePay);
  appendLine(componentLines, "Income tax withheld", details.incomeTax);
  appendLine(componentLines, "Late deductions", details.lateDeductions);
  appendLine(componentLines, "Leave-related deductions", details.leaveDeductions);
  appendLine(componentLines, "Unpaid leave deductions", details.unpaidLeaveDeductions);
  appendLine(componentLines, "Unpaid absence deductions", details.unpaidAbsenceDeductions);
  appendLine(componentLines, "Inactive period deductions", details.inactiveDeductions);

  details.allowances?.forEach((item) => appendLine(componentLines, `Allowance: ${item.type}`, item.amount));
  details.deductions?.forEach((item) => appendLine(componentLines, `Deduction: ${item.type}`, item.amount));

  if (componentLines.length > 2) {
    lines.push(...componentLines);
  }

  const attendanceLines = [
    "",
    "Attendance summary (if applicable):",
  ];
  if (details.workingDays !== undefined) attendanceLines.push(`- Working days in period: ${details.workingDays}`);
  if (details.activeDays !== undefined) attendanceLines.push(`- Active days: ${details.activeDays}`);
  if (details.overtimeHours !== undefined) attendanceLines.push(`- Overtime hours: ${details.overtimeHours}`);
  if (details.lateMinutes !== undefined) attendanceLines.push(`- Late minutes: ${details.lateMinutes}`);
  if (details.unpaidLeaveDays !== undefined) attendanceLines.push(`- Unpaid leave days: ${details.unpaidLeaveDays}`);
  if (details.unpaidAbsenceDays !== undefined) {
    attendanceLines.push(`- Unpaid absence days: ${details.unpaidAbsenceDays}`);
  }

  if (attendanceLines.length > 2) {
    lines.push(...attendanceLines);
  }

  return lines.join("\n");
}

export function buildPayslipExplanationPayload(payslipSummary: string, existingDraft?: string) {
  return {
    payslipSummary,
    existingDraft: existingDraft?.trim() || undefined,
  };
}
