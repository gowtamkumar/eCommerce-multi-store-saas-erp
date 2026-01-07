import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageEntity } from './entities/page.entity';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@Injectable()
export class PageService {
    constructor(
        @InjectRepository(PageEntity)
        private pageRepository: Repository<PageEntity>,
    ) { }

    async create(dto: CreatePageDto, tenantId: string) {
        // Check slug uniqueness within tenant
        const existing = await this.pageRepository.findOne({ where: { slug: dto.slug, tenantId } });
        if (existing) throw new ConflictException('Slug already exists for this tenant');

        // If setting as home page, unset other home pages for this tenant
        if (dto.isHomePage) {
            await this.pageRepository.update({ tenantId, isHomePage: true }, { isHomePage: false });
        }

        const page = this.pageRepository.create({ ...dto, tenantId });
        return await this.pageRepository.save(page);
    }

    async findAll(tenantId: string) {
        return await this.pageRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const page = await this.pageRepository.findOne({ where: { id, tenantId } });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async findBySlug(slug: string, tenantId: string) {
        const page = await this.pageRepository.findOne({ where: { slug, tenantId } });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async findHomePage(tenantId: string) {
        const page = await this.pageRepository.findOne({ where: { isHomePage: true, tenantId } });
        if (!page) throw new NotFoundException('Home page not found');
        return page;
    }

    async update(id: string, dto: UpdatePageDto, tenantId: string) {
        const page = await this.findOne(id, tenantId);

        if (dto.slug && dto.slug !== page.slug) {
            const existing = await this.pageRepository.findOne({ where: { slug: dto.slug, tenantId } });
            if (existing) throw new ConflictException('Slug already exists for this tenant');
        }

        if (dto.isHomePage && !page.isHomePage) {
            await this.pageRepository.update({ tenantId, isHomePage: true }, { isHomePage: false });
        }

        Object.assign(page, dto);
        return await this.pageRepository.save(page);
    }

    async remove(id: string, tenantId: string) {
        const page = await this.findOne(id, tenantId);
        await this.pageRepository.remove(page);
        return { success: true };
    }
}
