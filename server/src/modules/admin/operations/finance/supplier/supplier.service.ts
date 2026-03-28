import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto'
import { SupplierRepository } from './supplier.repository'

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name)

  constructor(
    private readonly repository: SupplierRepository,
  ) {}

  async createSupplier(dto: CreateSupplierDto, tenantId: string) {
    this.logger.log(`${this.createSupplier.name} Service Called`)
    return await this.repository.createAndSave(dto, tenantId)
  }

  async findAllSuppliers(tenantId: string) {
    this.logger.log(`${this.findAllSuppliers.name} Service Called`)
    return await this.repository.findAllByTenant(tenantId)
  }

  async findOneSupplier(id: string, tenantId: string) {
    this.logger.log(`${this.findOneSupplier.name} Service Called`)
    const supplier = await this.repository.findByIdAndTenant(id, tenantId)
    if (!supplier) {
      throw new NotFoundException('Supplier not found')
    }
    return supplier
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto, tenantId: string) {
    this.logger.log(`${this.updateSupplier.name} Service Called`)
    const supplier = await this.findOneSupplier(id, tenantId)
    return await this.repository.updateAndSave(supplier, dto)
  }

  async removeSupplier(id: string, tenantId: string) {
    this.logger.log(`${this.removeSupplier.name} Service Called`)
    const supplier = await this.findOneSupplier(id, tenantId)
    return await this.repository.removeSupplier(supplier)
  }
}
