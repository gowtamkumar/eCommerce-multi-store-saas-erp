import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { SubscriptionPlanService } from '@/modules/system/subscription-plan/subscription-plan.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantEntity } from './entities/tenant.entity'
import { TenantRepository } from './tenant.repository'
import { TenantOverviewResponseDto } from './dto/tenant-response.dto'

export interface CreateTenantResponseDto {
  tenant: TenantEntity
  admin: {
    id: string
    name: string
    username: string
    email: string
  }
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name)

  constructor(
    private tenantRepository: TenantRepository,
    private userRepository: UserRepository,
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) { }

  async createTenant(createTenantDto: CreateTenantDto): Promise<CreateTenantResponseDto> {
    this.logger.log(`${this.createTenant.name} Service Called`)
    const { storeName, subdomain, planId, name, username, email, password, subscriptionBillingCycle } = createTenantDto
    console.log("createTenantDto", createTenantDto);

    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findBySubdomain(subdomain)
    console.log("existingTenant", existingTenant);

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists')
    }

    let subscriptionPlan = null
    let billingCycle = subscriptionBillingCycle || SubscriptionBillingCycle.MONTHLY
    const now = new Date()

    // Trial duration: 14 days
    const trialEndsAt = new Date()
    trialEndsAt.setDate(now.getDate() + 14)

    if (planId) {
      console.log("planid");

      subscriptionPlan = await this.subscriptionPlanService.findOneSubscriptionPlan(planId)
      if (subscriptionPlan && !subscriptionBillingCycle) {
        billingCycle = subscriptionPlan.billingCycle
      }
    }

    console.log("Create tenant brfoere");


    // Create tenant
    const savedTenant = await this.tenantRepository.createAndSave(
      {
        storeName,
        subdomain,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        subscriptionBillingCycle: billingCycle,
        subscriptionStartsAt: now,
        subscriptionEndsAt: trialEndsAt,
      },
      subscriptionPlan,
    )

    // Create admin user for this tenant
    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const savedUser = await this.userRepository.createAndSave({
      name,
      username,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      tenantId: savedTenant.id,
      isAdmin: false,
      emailVerificationToken: verificationToken,
    })


    await this.tenantRepository.updateAndSave(savedTenant, { userId: savedUser.id })
    // Send verification email
    await this.mailService.sendVerificationEmail(
      email,
      verificationToken,
      savedTenant.id,
    )

    // Initialize Site Settings
    await this.settingsService.createSetting(savedTenant.id, {
      userId: savedUser.id,
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

  async findAllTenants(): Promise<TenantEntity[]> {
    this.logger.log(`${this.findAllTenants.name} Service Called`)
    return await this.tenantRepository.findAllSorted()
  }

  async findOneTenants(id: string): Promise<TenantEntity> {
    this.logger.log(`${this.findOneTenants.name} Service Called`)
    const tenant = await this.tenantRepository.findTenantById(id)
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    return tenant
  }

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    this.logger.log(`${this.findBySubdomain.name} Service Called`)
    return await this.tenantRepository.findBySubdomain(subdomain)
  }

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    this.logger.log(`${this.findByCustomDomain.name} Service Called`)
    return await this.tenantRepository.findByCustomDomain(customDomain)
  }

  async lookupTenant(subdomain?: string, customDomain?: string): Promise<TenantEntity> {
    this.logger.log(`${this.lookupTenant.name} Service Called`)
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

  async updateCustomDomain(id: string, customDomain: string): Promise<TenantEntity> {
    this.logger.log(`${this.updateCustomDomain.name} Service Called`)
    const tenant = await this.findOneTenants(id)
    return await this.tenantRepository.updateAndSave(tenant, {
      customDomain,
      customDomainStatus: CustomDomainStatus.PENDING,
      customDomainVerifiedAt: null,
    })
  }

  async verifyCustomDomain(id: string): Promise<TenantEntity> {
    this.logger.log(`${this.verifyCustomDomain.name} Service Called`)
    const tenant = await this.findOneTenants(id)
    // Mock verification: in a real app, you'd check DNS records here
    return await this.tenantRepository.updateAndSave(tenant, {
      customDomainStatus: CustomDomainStatus.ACTIVE,
      customDomainVerifiedAt: new Date(),
    })
  }

  async updateTenantStatus(id: string, status: string): Promise<TenantEntity> {
    this.logger.log(`${this.updateTenantStatus.name} Service Called`)
    const tenant = await this.findOneTenants(id)
    return await this.tenantRepository.updateAndSave(tenant, {
      status: status as TenantStatus,
    })
  }

  async tenantOverview(): Promise<TenantOverviewResponseDto> {
    this.logger.log(`${this.tenantOverview.name} Service Called`)
    const totalTenants = await this.tenantRepository.findCountByStatus()
    const activeTenants = await this.tenantRepository.findCountByStatus(TenantStatus.ACTIVE)
    const suspendedTenants = await this.tenantRepository.findCountByStatus(TenantStatus.SUSPENDED)
    const archivedTenants = await this.tenantRepository.findCountByStatus(TenantStatus.ARCHIVED)
    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      archivedTenants,
    }
  }

  isSubscriptionExpired(tenant: TenantEntity): boolean {
    return tenant.isExpired
  }
}
