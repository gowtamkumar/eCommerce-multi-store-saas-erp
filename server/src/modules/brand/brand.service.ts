import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandEntity } from './entities/brand.entity';

@Injectable()
export class BrandService {
    constructor(
        @InjectRepository(BrandEntity)
        private brandRepository: Repository<BrandEntity>,
    ) { }

    async create(createBrandDto: CreateBrandDto, tenantId: string) {
        const existing = await this.brandRepository.findOne({
            where: { slug: createBrandDto.slug, tenantId },
        });

        if (existing) {
            throw new ConflictException('Brand with this slug already exists');
        }

        const brand = this.brandRepository.create({
            ...createBrandDto,
            tenantId,
        });

        return await this.brandRepository.save(brand);
    }

    async findAll(tenantId: string) {
        return await this.brandRepository.find({
            where: { tenantId },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const brand = await this.brandRepository.findOne({
            where: { id, tenantId },
        });

        if (!brand) {
            throw new NotFoundException('Brand not found');
        }

        return brand;
    }

    async update(id: string, updateBrandDto: UpdateBrandDto, tenantId: string) {
        const brand = await this.findOne(id, tenantId);

        if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
            const existing = await this.brandRepository.findOne({
                where: { slug: updateBrandDto.slug, tenantId },
            });

            if (existing) {
                throw new ConflictException('Brand with this slug already exists');
            }
        }

        Object.assign(brand, updateBrandDto);
        return await this.brandRepository.save(brand);
    }

    async remove(id: string, tenantId: string) {
        const brand = await this.findOne(id, tenantId);
        await this.brandRepository.remove(brand);
        return { success: true, message: 'Brand deleted successfully' };
    }
}
