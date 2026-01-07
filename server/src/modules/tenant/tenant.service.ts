import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from '../admin/user/entities/user.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user/user-role.enum';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(TenantEntity)
        private tenantRepository: Repository<TenantEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private readonly settingsService: SettingsService,
    ) { }

    async create(createTenantDto: CreateTenantDto) {
        const { storeName, subdomain, planTier, adminName, adminUsername, adminEmail, adminPassword } =
            createTenantDto;

        // Check if subdomain already exists
        const existingTenant = await this.tenantRepository.findOne({
            where: { subdomain },
        });

        if (existingTenant) {
            throw new ConflictException('Subdomain already exists');
        }

        // Create tenant
        const tenant = this.tenantRepository.create({
            storeName,
            subdomain,
            planTier,
        });

        const savedTenant = await this.tenantRepository.save(tenant);

        // Create admin user for this tenant
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = this.userRepository.create({
            name: adminName,
            username: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            roles: [UserRole.Admin],
            tenantId: savedTenant.id,
            isAdmin: false,
        });

        const savedUser = await this.userRepository.save(adminUser);

        // Initialize Site Settings
        await this.settingsService.update(savedTenant.id, {
            brandName: storeName,
            siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
            contactEmail: adminEmail,
        });

        return {
            tenant: savedTenant,
            admin: {
                id: savedUser.id,
                name: savedUser.name,
                username: savedUser.username,
                email: savedUser.email,
            },
        };
    }

    async findAll() {
        return await this.tenantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        return tenant;
    }

    async findBySubdomain(subdomain: string) {
        const tenant = await this.tenantRepository.findOne({ where: { subdomain } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        return tenant;
    }

    async findByCustomDomain(customDomain: string) {
        const tenant = await this.tenantRepository.findOne({
            where: { customDomain },
        });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        return tenant;
    }

    async lookup(subdomain?: string, customDomain?: string) {
        if (customDomain) {
            return await this.findByCustomDomain(customDomain);
        }
        if (subdomain) {
            return await this.findBySubdomain(subdomain);
        }
        throw new NotFoundException('Subdomain or custom domain required');
    }
}
