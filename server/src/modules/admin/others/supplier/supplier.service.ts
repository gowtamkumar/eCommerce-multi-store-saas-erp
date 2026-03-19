import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { SupplierEntity } from './entities/supplier.entity';

@Injectable()
export class SupplierService {
    private readonly logger = new Logger(SupplierService.name);

    constructor(
        @InjectRepository(SupplierEntity)
        private readonly repository: Repository<SupplierEntity>,
    ) { }

    async createSupplier(dto: CreateSupplierDto, tenantId: string) {
        this.logger.log(`${this.createSupplier.name} Service Called`);
        const supplier = this.repository.create({
            ...dto,
            tenantId,
        });
        return await this.repository.save(supplier);
    }

    async findAllSuppliers(tenantId: string) {
        this.logger.log(`${this.findAllSuppliers.name} Service Called`);
        return await this.repository.find({
            where: { tenantId },
            order: { name: 'ASC' },
        });
    }

    async findOneSupplier(id: string, tenantId: string) {
        this.logger.log(`${this.findOneSupplier.name} Service Called`);
        const supplier = await this.repository.findOne({
            where: { id, tenantId },
        });
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }
        return supplier;
    }

    async updateSupplier(id: string, dto: UpdateSupplierDto, tenantId: string) {
        this.logger.log(`${this.updateSupplier.name} Service Called`);
        const supplier = await this.findOneSupplier(id, tenantId);
        Object.assign(supplier, dto);
        return await this.repository.save(supplier);
    }

    async removeSupplier(id: string, tenantId: string) {
        this.logger.log(`${this.removeSupplier.name} Service Called`);
        const supplier = await this.findOneSupplier(id, tenantId);
        return await this.repository.remove(supplier);
    }
}
