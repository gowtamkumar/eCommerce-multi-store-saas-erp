import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { Repository } from 'typeorm'
import { SubscriptionBillingCycle } from '../../common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '../../common/enums/subscription/subscription-status.enum'
import { UserRole } from '../../common/enums/user/user-role.enum'
import { UserEntity } from '../admin/user/entities/user.entity'
import { MailService } from '../others/mail/mail.service'
import { SettingsService } from '../settings/settings.service'
import { SubscriptionPlanService } from '../system-platform/subscription-plan/subscription-plan.service'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantEntity } from './entities/tenant.entity'

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) { }

  async create(createTenantDto: CreateTenantDto) {
    const { storeName, subdomain, planId, adminName, adminUsername, adminEmail, adminPassword } =
      createTenantDto

    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain },
    })

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists')
    }

    let subscriptionPlan = null;
    if (planId) {
      subscriptionPlan = await this.subscriptionPlanService.findOne(planId);
    }

    // Create tenant
    const now = new Date();
    const endsAt = new Date();
    endsAt.setMonth(now.getMonth() + 1); // Default to 1 month from now

    const tenant = this.tenantRepository.create({
      storeName,
      subdomain,
      subscriptionPlan,
      subscriptionStatus: SubscriptionStatus.Active,
      subscriptionBillingCycle: SubscriptionBillingCycle.Monthly,
      subscriptionStartsAt: now,
      subscriptionEndsAt: endsAt,
    })

    const savedTenant = await this.tenantRepository.save(tenant)

    // Create admin user for this tenant
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const adminUser = this.userRepository.create({
      name: adminName,
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.Admin,
      tenantId: savedTenant.id,
      isAdmin: false,
      emailVerificationToken: verificationToken,
    })

    const savedUser = await this.userRepository.save(adminUser)

    // Send verification email
    await this.mailService.sendVerificationEmail(adminEmail, verificationToken, savedTenant.id)

    // Initialize Site Settings
    await this.settingsService.update(savedTenant.id, {
      brandName: storeName,
      siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
      contactEmail: adminEmail,
    })

    return {
      tenant: savedTenant,
      admin: {
        id: savedUser.id,
        name: savedUser.name,
        username: savedUser.username,
        email: savedUser.email,
      },
    }
  }

  async findAll() {
    return await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    return tenant
  }

  async findBySubdomain(subdomain: string) {
    const tenant = await this.tenantRepository.findOne({ where: { subdomain } })
    // if (!tenant) {
    //   throw new NotFoundException('Tenant not found')
    // }
    return tenant
  }

  async findByCustomDomain(customDomain: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { customDomain },
    })

    // if (!tenant) {
    //   throw new NotFoundException('Tenant not found')
    // }
    return tenant
  }

  async lookup(subdomain?: string, customDomain?: string) {
    let domain = {} as any

    if (customDomain) {
      domain = await this.findByCustomDomain(customDomain)
    }

    if (subdomain) {
      domain = await this.findBySubdomain(subdomain)
    }

    if (!domain) {
      throw new NotFoundException('Subdomain or custom domain required')
    }
    return domain
  }

  async updateCustomDomain(id: string, customDomain: string) {
    const tenant = await this.findOne(id)
    tenant.customDomain = customDomain
    tenant.customDomainStatus = 'pending'
    tenant.customDomainVerifiedAt = null
    return await this.tenantRepository.save(tenant)
  }

  async verifyCustomDomain(id: string) {
    const tenant = await this.findOne(id)
    // Mock verification: in a real app, you'd check DNS records here
    tenant.customDomainStatus = 'active'
    tenant.customDomainVerifiedAt = new Date()
    return await this.tenantRepository.save(tenant)
  }

  async updateStatus(id: string, status: string) {
    const tenant = await this.findOne(id)
    tenant.status = status
    return await this.tenantRepository.save(tenant)
  }
}
