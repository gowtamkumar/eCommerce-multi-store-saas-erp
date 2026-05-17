import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  IsNumber,
} from 'class-validator'
import { Type } from 'class-transformer'
import { EmployeeStatus, ContractType } from '@/common/enums/hrm/hrm-enums'

export class CreateDepartmentDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  description?: string
}

export class CreateDesignationDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  grade?: string

  @IsString()
  @IsOptional()
  salaryBand?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsUUID()
  departmentId: string
}

export class SalaryConfigDto {
  @IsNumber()
  basicSalary: number

  @IsArray()
  @IsOptional()
  allowances?: { type: string; amount: number }[]

  @IsArray()
  @IsOptional()
  deductions?: { type: string; amount: number }[]
}

export class CreateEmployeePersonalDetailsDto {
  @IsDateString()
  @IsOptional()
  dob?: string

  @IsString()
  @IsOptional()
  gender?: string

  @IsString()
  @IsOptional()
  nationalId?: string

  @IsString()
  @IsOptional()
  passportNo?: string

  @IsOptional()
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }

  @IsString()
  @IsOptional()
  bloodGroup?: string

  @IsString()
  @IsOptional()
  address?: string
}

export class CreateEmployeeDto {
  @IsUUID()
  userId: string

  @IsUUID()
  @IsOptional()
  branchId?: string

  @IsUUID()
  @IsOptional()
  warehouseId?: string

  @IsUUID()
  departmentId: string

  @IsUUID()
  designationId: string

  @IsUUID()
  @IsOptional()
  managerId?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType

  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryConfigDto)
  salaryConfig?: SalaryConfigDto

  @IsDateString()
  joiningDate: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeePersonalDetailsDto)
  personalDetails?: CreateEmployeePersonalDetailsDto
}

export class UpdateEmployeeDto {
  @IsUUID()
  @IsOptional()
  branchId?: string

  @IsUUID()
  @IsOptional()
  departmentId?: string

  @IsUUID()
  @IsOptional()
  designationId?: string

  @IsUUID()
  @IsOptional()
  managerId?: string

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType

  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryConfigDto)
  salaryConfig?: SalaryConfigDto

  @IsDateString()
  @IsOptional()
  exitDate?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeePersonalDetailsDto)
  personalDetails?: CreateEmployeePersonalDetailsDto
}

export class CreateShiftDto {
  @IsString()
  name: string

  @IsString()
  startTime: string // HH:mm:ss

  @IsString()
  endTime: string // HH:mm:ss

  @IsNumber()
  @IsOptional()
  graceMinutes?: number

  @IsOptional()
  isNightShift?: boolean
}

export class AssignShiftDto {
  @IsUUID()
  shiftId: string

  @IsDateString()
  effectiveFrom: string

  @IsDateString()
  @IsOptional()
  effectiveTo?: string
}
