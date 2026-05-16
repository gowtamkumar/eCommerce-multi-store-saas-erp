import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'
import { GoodsReceivedNoteEntity } from './entities/goods-received-note.entity'

@Injectable()
export class ProcurementRepository {
  constructor(
    @InjectRepository(SupplierEntity)
    public readonly supplierRepo: Repository<SupplierEntity>,
    @InjectRepository(PurchaseOrderEntity)
    public readonly poRepo: Repository<PurchaseOrderEntity>,
    @InjectRepository(GoodsReceivedNoteEntity)
    public readonly grnRepo: Repository<GoodsReceivedNoteEntity>,
  ) { }

  // --- Suppliers ---
  async createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity> {
    return this.supplierRepo.save(this.supplierRepo.create(data))
  }

  async findAllSuppliers(tenantId: string): Promise<SupplierEntity[]> {
    return this.supplierRepo.find({ where: { tenantId } })
  }

  // --- Purchase Orders ---
  async createPO(data: Partial<PurchaseOrderEntity>): Promise<PurchaseOrderEntity> {
    return this.poRepo.save(this.poRepo.create(data))
  }

  async findPOById(id: string, tenantId: string): Promise<PurchaseOrderEntity | null> {
    return this.poRepo.findOne({ where: { id, tenantId }, relations: ['supplier', 'branch'] })
  }

  async updatePOStatus(id: string, status: any): Promise<void> {
    await this.poRepo.update(id, { status })
  }

  // --- GRN ---
  async createGRN(data: Partial<GoodsReceivedNoteEntity>): Promise<GoodsReceivedNoteEntity> {
    return this.grnRepo.save(this.grnRepo.create(data))
  }
}
