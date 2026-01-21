import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto, tenantId: string) {
        const existing = await this.categoryRepository.findOne({
            where: { slug: createCategoryDto.slug, tenantId },
        });

        if (existing) {
            throw new ConflictException('Category with this slug already exists');
        }

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            tenantId,
        });

        return await this.categoryRepository.save(category);
    }

    async findAll(tenantId: string) {
        return await this.categoryRepository.find({
            where: { tenantId },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const category = await this.categoryRepository.findOne({
            where: { id, tenantId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto, tenantId: string) {
        const category = await this.findOne(id, tenantId);

        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existing = await this.categoryRepository.findOne({
                where: { slug: updateCategoryDto.slug, tenantId },
            });

            if (existing) {
                throw new ConflictException('Category with this slug already exists');
            }
        }

        Object.assign(category, updateCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async remove(id: string, tenantId: string) {
        const category = await this.findOne(id, tenantId);
        await this.categoryRepository.remove(category);
        return { success: true, message: 'Category deleted successfully' };
    }
}
