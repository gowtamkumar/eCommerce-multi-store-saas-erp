import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DepartmentEntity } from '../entities/department.entity'
import { DesignationEntity } from '../entities/designation.entity'

@Injectable()
export class HrmOrganizationRepository extends BaseStoreRepository<DepartmentEntity> {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
    @InjectRepository(DesignationEntity)
    private readonly designationRepo: Repository<DesignationEntity>,
  ) {
    super(DepartmentEntity, departmentRepo)
  }

  // --- Department ---
  async createDepartment(data: Partial<DepartmentEntity>): Promise<DepartmentEntity> {
    return this.departmentRepo.save(this.departmentRepo.create(data))
  }

  async findAllDepartments(storeId: string): Promise<DepartmentEntity[]> {
    return this.departmentRepo.find({ where: { storeId } })
  }

  async findDepartmentById(id: string, storeId: string): Promise<DepartmentEntity | null> {
    return this.departmentRepo.findOne({ where: { id, storeId } })
  }

  async updateDepartment(id: string, data: Partial<DepartmentEntity>): Promise<void> {
    await this.departmentRepo.update(id, data)
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.departmentRepo.softDelete(id)
  }

  // --- Designation ---
  async createDesignation(data: Partial<DesignationEntity>): Promise<DesignationEntity> {
    return this.designationRepo.save(this.designationRepo.create(data))
  }

  async findAllDesignations(storeId: string): Promise<DesignationEntity[]> {
    return this.designationRepo.find({
      where: { storeId },
      relations: {
        department: true,
      },
    })
  }

  async findDesignationById(id: string, storeId: string): Promise<DesignationEntity | null> {
    return this.designationRepo.findOne({ where: { id, storeId } })
  }

  async updateDesignation(id: string, data: Partial<DesignationEntity>): Promise<void> {
    await this.designationRepo.update(id, data)
  }

  async deleteDesignation(id: string): Promise<void> {
    await this.designationRepo.softDelete(id)
  }
}
