import { fetchAPI } from "./api";

export async function getHrmDashboardStats() {
  const res = await fetchAPI("/operations/hrm/dashboard/stats");
  return res.data;
}

// ─────────────────────────────────────────────────
// Employee
// ─────────────────────────────────────────────────
export async function getEmployees() {
  const res = await fetchAPI("/operations/hrm/employees");
  return res.data;
}

export async function getAttendanceEmployees() {
  const res = await fetchAPI("/operations/hrm/employees/attendance");
  return res.data;
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
export async function checkIn(employeeId: string, ip?: string) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/check-in`,
    {
      method: "POST",
      body: JSON.stringify({ ip: ip || "" }),
    },
  );
  return res.data;
}

export async function checkOut(employeeId: string) {
  const res = await fetchAPI(
    `/operations/hrm/employees/${employeeId}/check-out`,
    {
      method: "POST",
    },
  );
  return res.data;
}

export async function getAttendanceSessions() {
  const res = await fetchAPI("/operations/hrm/attendance");
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

export async function getLeaveRequests() {
  const res = await fetchAPI("/operations/hrm/leaves");
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
