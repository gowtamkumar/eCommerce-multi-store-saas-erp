import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { AccountEntity } from '@/modules/admin/operations/finance/accounting/entities/account.entity'

describe('Onboarding Module (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let createdTenantId: string | null = null

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
  })

  afterAll(async () => {
    if (createdTenantId) {
      const tenantRepo = dataSource.getRepository(TenantEntity)
      await tenantRepo.delete(createdTenantId)
    }
    if (app) {
      await app.close()
    }
  })

  describe('POST /onboard', () => {
    it('should successfully onboard a new tenant with localized configuration settings', async () => {
      const subdomain = `e2e-onboard-${Date.now()}`
      const payload = {
        storeName: 'Global Onboarding E2E Store',
        subdomain,
        name: 'Onboard Owner',
        username: `owner-${Date.now()}`,
        email: `owner-${Date.now()}@e2etest.com`,
        password: 'Password123!',
        country: 'US',
        baseCurrency: 'USD',
        timezone: 'America/New_York',
      }

      const response = await request(app.getHttpServer())
        .post('/onboard')
        .send(payload)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.subdomain).toBe(subdomain)

      // Query DB to verify tenant records
      const tenantRepo = dataSource.getRepository(TenantEntity)
      const tenant = await tenantRepo.findOne({ where: { subdomain } })
      expect(tenant).toBeDefined()
      expect(tenant.id).toBeDefined()
      createdTenantId = tenant.id

      // Verify site settings are correctly localized
      const settingsRepo = dataSource.getRepository(SiteSettingsEntity)
      const settings = await settingsRepo.findOne({ where: { tenantId: tenant.id } })
      expect(settings).toBeDefined()
      expect(settings.currency).toBe('USD')
      expect(settings.currencySymbol).toBe('$')
      expect(settings.timezone).toBe('America/New_York')
      expect(settings.locale).toBe('en-US')
      expect(settings.supportedCurrencies).toHaveLength(1)
      expect(settings.supportedCurrencies[0].code).toBe('USD')
      expect(settings.supportedCurrencies[0].symbol).toBe('$')

      // Verify Chart of Accounts are seeded
      const accountRepo = dataSource.getRepository(AccountEntity)
      const accounts = await accountRepo.find({ where: { tenantId: tenant.id } })
      expect(accounts.length).toBeGreaterThan(0)
    })
  })
})
