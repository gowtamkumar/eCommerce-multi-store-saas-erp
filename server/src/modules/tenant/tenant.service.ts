import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { CustomDomainStatus } from 'src/common/enums/tenant/custom-domain-status'
import { TenantStatus } from 'src/common/enums/tenant/tenant-status.enum'
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
    private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) { }

  async createTenant(createTenantDto: CreateTenantDto) {
      this.logger.log(`${this.createTenant.name} Service Called`);
    const { storeName, subdomain, planId, name, username, email, password } = createTenantDto
    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain },
    })

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists')
    }

    let subscriptionPlan = null
    if (planId) {
      subscriptionPlan = await this.subscriptionPlanService.findOneSubscriptionPlan(planId)
    }
    // Create tenant
    const now = new Date()
    const endsAt = new Date()
    endsAt.setMonth(now.getMonth() + 1) // Default to 1 month from now

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
    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const adminUser = this.userRepository.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: UserRole.Admin,
      tenantId: savedTenant.id,
      isAdmin: false,
      emailVerificationToken: verificationToken,
    })

    const savedUser = await this.userRepository.save(adminUser)

    // Send verification email
    const mailRes = await this.mailService.sendVerificationEmail(
      email,
      verificationToken,
      savedTenant.id,
    )

    // Initialize Site Settings
    const res = await this.settingsService.updateSettings(savedTenant.id, {
      brandName: storeName,
      siteDescription: `Welcome to ${storeName}! Premium products and excellent service.`,
      contactEmail: email,
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

  async findAllTenants() {
      this.logger.log(`${this.findAllTenants.name} Service Called`);
    return await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findOneTenants(id: string) {
      this.logger.log(`${this.findOneTenants.name} Service Called`);
    const tenant = await this.tenantRepository.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    return tenant
  }

  async findBySubdomain(subdomain: string) {
      this.logger.log(`${this.findBySubdomain.name} Service Called`);
    const tenant = await this.tenantRepository.findOne({ where: { subdomain } })
    // if (!tenant) {
    //   throw new NotFoundException('Tenant not found')
    // }
    return tenant
  }

  async findByCustomDomain(customDomain: string) {
      this.logger.log(`${this.findByCustomDomain.name} Service Called`);
    const tenant = await this.tenantRepository.findOne({
      where: { customDomain },
    })

    // if (!tenant) {
    //   throw new NotFoundException('Tenant not found')
    // }
    return tenant
  }

  async lookupTenant(subdomain?: string, customDomain?: string) {
      this.logger.log(`${this.lookupTenant.name} Service Called`);
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
      this.logger.log(`${this.updateCustomDomain.name} Service Called`);
    const tenant = await this.findOneTenants(id)
    tenant.customDomain = customDomain
    tenant.customDomainStatus = CustomDomainStatus.PENDING
    tenant.customDomainVerifiedAt = null
    return await this.tenantRepository.save(tenant)
  }

  async verifyCustomDomain(id: string) {
      this.logger.log(`${this.verifyCustomDomain.name} Service Called`);
    const tenant = await this.findOneTenants(id)
    // Mock verification: in a real app, you'd check DNS records here
    tenant.customDomainStatus = CustomDomainStatus.ACTIVE
    tenant.customDomainVerifiedAt = new Date()
    return await this.tenantRepository.save(tenant)
  }

  async updateTenantStatus(id: string, status: string) {
      this.logger.log(`${this.updateTenantStatus.name} Service Called`);
    const tenant = await this.findOneTenants(id)
    tenant.status = status as TenantStatus
    return await this.tenantRepository.save(tenant)
  }


  async tenantOverview() {
      this.logger.log(`${this.tenantOverview.name} Service Called`);
    const totalTenants = await this.tenantRepository.count()
    const activeTenants = await this.tenantRepository.count({
      where: { status: TenantStatus.ACTIVE },
    })
    const suspendedTenants = await this.tenantRepository.count({
      where: { status: TenantStatus.SUSPENDED },
    })
    const archivedTenants = await this.tenantRepository.count({
      where: { status: TenantStatus.ARCHIVED },
    })
    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      archivedTenants,
    }
  }
}
