export interface Designation {
  id: string;
  name: string;
  grade?: string;
  salaryBand?: string;
  description?: string;
  departmentId: string;
  department?: { name: string };
  employeeCount?: number;
}

export interface DesignationDepartment {
  id: string;
  name: string;
}

export interface DesignationFormData {
  name: string;
  grade: string;
  salaryBand: string;
  description: string;
  departmentId: string;
}
