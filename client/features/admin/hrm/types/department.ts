export interface Department {
  id: string;
  name: string;
  code?: string;
  parentDepartmentId?: string;
  description?: string;
  employeeCount?: number;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
}
