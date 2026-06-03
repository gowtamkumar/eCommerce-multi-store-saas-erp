export const PAYROLL_ACCRUED_EVENT = 'payroll.accrued'
export const PAYROLL_PAID_EVENT = 'payroll.paid'

export interface PayrollAccruedEventPayload {
  batchId: string
  name: string
  period: string
  totalSalary: number
  totalTaxesWithheld: number
  totalDeductions: number
  totalAmount: number
}

export interface PayrollPaidEventPayload {
  batchId: string
  name: string
  totalAmount: number
}
