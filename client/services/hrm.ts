/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAPI } from "./api";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Helper to unwrap a possibly-paginated response into a plain array
 * so legacy callers that expect `T[]` keep working unchanged.
 */
function unwrapList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && Array.isArray(payload.data)) return payload.data as T[];
  return [];
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getHrmDashboardStats() {
  const res = await fetchAPI("/operations/hrm/dashboard/stats");
  return res.data;
}

// ─────────────────────────────────────────────────
// Employee
// ─────────────────────────────────────────────────
export async function getEmployees(): Promise<any[]> {
  const res = await fetchAPI("/operations/hrm/employees");
  return unwrapList(res.data);
}

export async function getEmployeesPage(params?: {
  page?: number;
  limit?: number;
  q?: string;
  departmentId?: string;
  status?: string;
}): Promise<PaginatedResult<any>> {
  const res = await fetchAPI(`/operations/hrm/employees${buildQuery(params)}`);
  if (Array.isArray(res.data)) {
    return { data: res.data, total: res.data.length, page: 1, limit: res.data.length };
  }
  return res.data;
}

export async function getAttendanceEmployees(): Promise<any[]> {
  const res = await fetchAPI("/operations/hrm/employees/attendance");
  return unwrapList(res.data);
}

export async function getEmployee(id: string) {
  const res = await fetchAPI(`/operations/hrm/employees/${id}`);
  return res.data;
}

export async function createEmployee(data: any) {
  const res = await fetchAPI("/operations/hrm/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateEmployee(id: string, data: any) {
  const res = await fetchAPI(`/operations/hrm/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Department
// ─────────────────────────────────────────────────
export async function getDepartments() {
  const res = await fetchAPI("/operations/hrm/departments");
  return res.data;
}

export async function createDepartment(data: any) {
  const res = await fetchAPI("/operations/hrm/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateDepartment(id: string, data: any) {
  const res = await fetchAPI(`/operations/hrm/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteDepartment(id: string) {
  const res = await fetchAPI(`/operations/hrm/departments/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Designation
// ─────────────────────────────────────────────────
export async function getDesignations() {
  const res = await fetchAPI("/operations/hrm/designations");
  return res.data;
}

export async function createDesignation(data: any) {
  const res = await fetchAPI("/operations/hrm/designations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateDesignation(id: string, data: any) {
  const res = await fetchAPI(`/operations/hrm/designations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteDesignation(id: string) {
  const res = await fetchAPI(`/operations/hrm/designations/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────
export interface CheckInOptions {
  ip?: string;
  source?: "WEB" | "MOBILE" | "BIOMETRIC" | "POS" | "KIOSK";
  deviceId?: string;
  gpsLat?: number;
  gpsLong?: number;
  photoUrl?: string;
  timezoneOffset?: number;
}

export async function checkIn(employeeId: string, ipOrOptions?: string | CheckInOptions) {
  const body: CheckInOptions =
    typeof ipOrOptions === "string"
      ? { ip: ipOrOptions || "" }
      : { ip: "", ...(ipOrOptions || {}) };
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/check-in`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return res.data;
}

export async function checkOut(
  employeeId: string,
  options?: { source?: CheckInOptions["source"]; deviceId?: string },
) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/check-out`,
    {
      method: "POST",
      body: JSON.stringify(options || {}),
    },
  );
  return res.data;
}

export async function getAttendanceSessions(): Promise<any[]> {
  const res = await fetchAPI("/operations/hrm/attendance");
  return unwrapList(res.data);
}

export async function getAttendanceSessionsPage(params?: {
  page?: number;
  limit?: number;
  employeeId?: string;
  from?: string;
  to?: string;
}): Promise<PaginatedResult<any>> {
  const res = await fetchAPI(`/operations/hrm/attendance${buildQuery(params)}`);
  if (Array.isArray(res.data)) {
    return { data: res.data, total: res.data.length, page: 1, limit: res.data.length };
  }
  return res.data;
}

// ─────────────────────────────────────────────────
// Leave
// ─────────────────────────────────────────────────
export async function requestLeave(employeeId: string, data: any) {
  const res = await fetchAPI(`/operations/hrm/employees/${employeeId}/leaves`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function approveLeave(
  requestId: string,
  approvedById: string,
  managerNote: string,
) {
  const res = await fetchAPI(`/operations/hrm/leaves/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify({ approvedById, managerNote }),
  });
  return res.data;
}

export async function rejectLeave(
  requestId: string,
  rejectedById: string,
  managerNote: string,
) {
  const res = await fetchAPI(`/operations/hrm/leaves/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectedById, managerNote }),
  });
  return res.data;
}

export async function getLeaveRequests(): Promise<any[]> {
  const res = await fetchAPI("/operations/hrm/leaves");
  return unwrapList(res.data);
}

export async function getLeaveRequestsPage(params?: {
  page?: number;
  limit?: number;
  employeeId?: string;
  status?: string;
  from?: string;
  to?: string;
}): Promise<PaginatedResult<any>> {
  const res = await fetchAPI(`/operations/hrm/leaves${buildQuery(params)}`);
  if (Array.isArray(res.data)) {
    return { data: res.data, total: res.data.length, page: 1, limit: res.data.length };
  }
  return res.data;
}

// ─────────────────────────────────────────────────
// Payroll
// ─────────────────────────────────────────────────
export async function processPayroll(period: string, name: string) {
  const res = await fetchAPI("/operations/hrm/payroll/process", {
    method: "POST",
    body: JSON.stringify({ period, name }),
  });
  return res.data;
}

export async function getPayrollBatches() {
  const res = await fetchAPI("/operations/hrm/payroll/batches");
  return res.data;
}

export async function getPayrollSlips(batchId: string) {
  const res = await fetchAPI(
    `/operations/hrm/payroll/batches/${batchId}/slips`,
  );
  return res.data;
}

export async function approvePayrollBatch(batchId: string, approvedById: string) {
  const res = await fetchAPI(
    `/operations/hrm/payroll/batches/${batchId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ approvedById }),
    },
  );
  return res.data;
}

export async function payPayrollBatch(batchId: string) {
  const res = await fetchAPI(`/operations/hrm/payroll/batches/${batchId}/pay`, {
    method: "POST",
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Shifts
// ─────────────────────────────────────────────────
export async function getShifts() {
  const res = await fetchAPI("/operations/hrm/shifts");
  return res.data;
}

export async function createShift(data: any) {
  const res = await fetchAPI("/operations/hrm/shifts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateShift(id: string, data: any) {
  const res = await fetchAPI(`/operations/hrm/shifts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteShift(id: string) {
  const res = await fetchAPI(`/operations/hrm/shifts/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function assignShift(employeeId: string, data: any) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/assign-shift`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return res.data;
}

export async function getEmployeeShifts(employeeId: string) {
  const res = await fetchAPI(`/operations/hrm/employees/${employeeId}/shifts`);
  return res.data;
}

// ─────────────────────────────────────────────────
// Recruitment (ATS)
// ─────────────────────────────────────────────────
export async function createJobPosting(data: any) {
  const res = await fetchAPI("/operations/hrm/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getJobPostings() {
  const res = await fetchAPI("/operations/hrm/jobs");
  return res.data;
}

export async function applyForJob(data: any) {
  const res = await fetchAPI("/operations/hrm/applicants", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getApplicants() {
  const res = await fetchAPI("/operations/hrm/applicants");
  return res.data;
}

export async function scheduleInterview(data: any) {
  const res = await fetchAPI("/operations/hrm/interviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateApplicantStatus(id: string, status: string) {
  const res = await fetchAPI(`/operations/hrm/applicants/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function getApplicantInterviews(applicantId: string) {
  const res = await fetchAPI(
    `/operations/hrm/applicants/${applicantId}/interviews`,
  );
  return res.data;
}

export async function onboardApplicant(id: string) {
  const res = await fetchAPI(`/operations/hrm/applicants/${id}/onboard`, {
    method: "POST",
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Performance
// ─────────────────────────────────────────────────
export async function createPerformanceReview(data: any) {
  const res = await fetchAPI("/operations/hrm/performance/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getPerformanceReviews() {
  const res = await fetchAPI("/operations/hrm/performance/reviews");
  return res.data;
}

export async function getEmployeePerformanceReviews(employeeId: string) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/performance/reviews`,
  );
  return res.data;
}

export async function getEmployeePerformance(
  employeeId: string,
  period: string,
) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/performance?period=${period}`,
  );
  return res.data;
}

export async function seedDemoData() {
  const res = await fetchAPI("/operations/hrm/seed", {
    method: "POST",
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Employee Documents (HR Document Vault)
// ─────────────────────────────────────────────────
export async function getEmployeeDocuments(employeeId: string) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/documents`,
  );
  return res.data;
}

export async function addEmployeeDocument(
  employeeId: string,
  data: { documentType: string; fileUrl: string; expiryDate?: string },
) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/documents`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return res;
}

export async function deleteEmployeeDocument(
  employeeId: string,
  docId: string,
) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/documents/${docId}`,
    {
      method: "DELETE",
    },
  );
  return res;
}

// ─────────────────────────────────────────────────
// Holidays
// ─────────────────────────────────────────────────
export interface HolidayPayload {
  date: string;
  name: string;
  isOptional?: boolean;
  description?: string;
  branchId?: string | null;
}

export async function getHolidays(params?: { year?: number; branchId?: string }) {
  const res = await fetchAPI(`/operations/hrm/holidays${buildQuery(params)}`);
  return unwrapList(res.data);
}

export async function createHoliday(data: HolidayPayload) {
  const res = await fetchAPI("/operations/hrm/holidays", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateHoliday(id: string, data: Partial<HolidayPayload>) {
  const res = await fetchAPI(`/operations/hrm/holidays/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteHoliday(id: string) {
  const res = await fetchAPI(`/operations/hrm/holidays/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

// ─────────────────────────────────────────────────
// Tax Brackets
// ─────────────────────────────────────────────────
export interface TaxBracketPayload {
  fiscalYear: number;
  minAmount: number;
  maxAmount?: number | null;
  rate: number;
  flatTax?: number;
  sortOrder?: number;
}

export async function getTaxBrackets(fiscalYear?: number) {
  const res = await fetchAPI(
    `/operations/hrm/tax-brackets${buildQuery({ fiscalYear })}`,
  );
  return unwrapList(res.data);
}

export async function createTaxBracket(data: TaxBracketPayload) {
  const res = await fetchAPI("/operations/hrm/tax-brackets", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteTaxBracket(id: string) {
  const res = await fetchAPI(`/operations/hrm/tax-brackets/${id}`, {
    method: "DELETE",
  });
  return res.data;
}
