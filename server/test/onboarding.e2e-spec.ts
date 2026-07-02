import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppModule } from './../src/app.module'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { AccountEntity } from '@/modules/admin/operations/finance/accounting/entities/account.entity'

describe('Onboarding Module (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let createdStoreId: string | null = null

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
  })

  afterAll(async () => {
    if (createdStoreId) {
      const storeRepo = dataSource.getRepository(StoreEntity)
      await storeRepo.delete(createdStoreId)
    }
    if (app) {
      await app.close()
    }
  })

  describe('POST /onboard', () => {
    it('should successfully onboard a new store with localized configuration settings', async () => {
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

      // Query DB to verify store records
      const storeRepo = dataSource.getRepository(StoreEntity)
      const store = await storeRepo.findOne({ where: { subdomain } })
      expect(store).toBeDefined()
      expect(store.id).toBeDefined()
      createdStoreId = store.id

      // Verify site settings are correctly localized
      const settingsRepo = dataSource.getRepository(SiteSettingsEntity)
      const settings = await settingsRepo.findOne({ where: { storeId: store.id } })
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
      const accounts = await accountRepo.find({ where: { storeId: store.id } })
      expect(accounts.length).toBeGreaterThan(0)
    })
  })
})
