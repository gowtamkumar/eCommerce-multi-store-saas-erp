import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from './entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
    constructor(
        @InjectRepository(SupplierEntity)
        private readonly repository: Repository<SupplierEntity>,
    ) { }

    async create(dto: CreateSupplierDto, tenantId: string) {
        const supplier = this.repository.create({
            ...dto,
            tenantId,
        });
        return await this.repository.save(supplier);
    }

    async findAll(tenantId: string) {
        return await this.repository.find({
            where: { tenantId },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const supplier = await this.repository.findOne({
            where: { id, tenantId },
        });
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }
        return supplier;
    }

    async update(id: string, dto: UpdateSupplierDto, tenantId: string) {
        const supplier = await this.findOne(id, tenantId);
        Object.assign(supplier, dto);
        return await this.repository.save(supplier);
    }

    async remove(id: string, tenantId: string) {
        const supplier = await this.findOne(id, tenantId);
        return await this.repository.remove(supplier);
    }
}
