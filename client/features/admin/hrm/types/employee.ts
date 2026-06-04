export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  PROBATION = 'PROBATION',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACTUAL = 'CONTRACTUAL',
  INTERN = 'INTERN',
}

export interface Employee {
  id: string
  userId: string
  employeeCode?: string
  branchId?: string
  warehouseId?: string
  departmentId: string
  designationId: string
  status: EmployeeStatus
  contractType: ContractType
  joiningDate: string
  exitDate?: string
  managerId?: string
  manager?: {
    id: string
    user?: {
      name: string
    }
  }
  salaryConfig?: {
    basicSalary: number
    allowances: { type: string; amount: number }[]
    deductions: { type: string; amount: number }[]
  }
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  department?: {
    id: string
    name: string
  }
  designation?: {
    id: string
    name: string
  }
  branch?: {
    id: string
    name: string
  }
  warehouse?: {
    id: string
    name: string
  }
  personalDetails?: EmployeePersonalDetails
  documents?: EmployeeDocument[]
}

export interface EmployeePersonalDetails {
  dob?: string
  gender?: string
  nationalId?: string
  passportNo?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  bloodGroup?: string
  address?: string
}

export interface EmployeeDocument {
  id: string
  documentType: string
  fileUrl: string
  expiryDate?: string
  status: string
}

export interface EmployeeLookupOption {
  id: string
  name: string
}

export interface EmployeeUserOption extends EmployeeLookupOption {
  email: string
}

export interface EmployeeManagerOption {
  id: string
  user?: { name: string }
}

export interface EmployeeSalaryLine {
  type: string
  amount: number
}

export interface EmployeeFormData {
  userId: string
  departmentId: string
  designationId: string
  managerId: string
  branchId: string
  status: EmployeeStatus
  contractType: ContractType
  joiningDate: string
  exitDate: string
  salaryConfig: {
    basicSalary: number
    allowances: EmployeeSalaryLine[]
    deductions: EmployeeSalaryLine[]
  }
  personalDetails: {
    gender: string
    bloodGroup: string
    nationalId: string
    passportNo: string
    address: string
    dob: string
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
  }
  documents: Partial<EmployeeDocument>[]
}

export type EmployeeSubmitPayload = Partial<EmployeeFormData>
