import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { ReportSchedulerService } from './report-scheduler.service'

describe('ReportSchedulerService', () => {
  let service: ReportSchedulerService
  let storeRepo: any
  let reportService: any
  let mailService: any
  let settingsService: any

  beforeEach(async () => {
    storeRepo = {
      find: jest.fn().mockResolvedValue([
        { id: 'store-1', storeName: 'Test Store 1', status: StoreStatus.ACTIVE },
      ]),
    }

    reportService = {
      getProfitLossReport: jest.fn().mockResolvedValue({
        revenue: { total: 1000 },
        cogs: { total: 400 },
        grossProfit: 600,
        operatingExpenses: { total: 200 },
        netProfit: 400,
      }),
      getDashboardReport: jest.fn().mockResolvedValue({
        periodOrders: 10,
        avgOrderValue: 100,
        lowStockCount: 2,
      }),
      exportReport: jest.fn().mockImplementation((ctx, type) => {
        return Promise.resolve({
          csv: 'col1,col2\nval1,val2',
          filename: `${type}-report.csv`,
        })
      }),
    }

    mailService = {
      sendGenericEmail: jest.fn().mockResolvedValue(undefined),
      sendGenericEmailWithAttachments: jest.fn().mockResolvedValue(undefined),
      getTransporter: jest.fn().mockResolvedValue({
        transporter: {
          sendMail: jest.fn().mockResolvedValue(undefined),
        },
        from: 'noreply@example.com',
      }),
    }

    settingsService = {
      findByStoreSettings: jest.fn().mockResolvedValue({
        contactEmail: 'admin@store1.com',
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportSchedulerService,
        {
          provide: getRepositoryToken(StoreEntity),
          useValue: storeRepo,
        },
        {
          provide: ReportService,
          useValue: reportService,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: SettingsService,
          useValue: settingsService,
        },
      ],
    }).compile()

    service = module.get<ReportSchedulerService>(ReportSchedulerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should process active stores and send weekly email summary', async () => {
    await service.sendWeeklyReportEmails()

    expect(storeRepo.find).toHaveBeenCalledWith({
      where: { status: StoreStatus.ACTIVE },
      select: { id: true, storeName: true },
    })

    expect(settingsService.findByStoreSettings).toHaveBeenCalled()
    expect(reportService.getProfitLossReport).toHaveBeenCalled()
    expect(reportService.getDashboardReport).toHaveBeenCalled()
    expect(reportService.exportReport).toHaveBeenCalledTimes(2)
    expect(mailService.sendGenericEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'admin@store1.com',
      attachments: expect.arrayContaining([
        expect.objectContaining({ filename: 'sales-report.csv' }),
        expect.objectContaining({ filename: 'expenses-report.csv' }),
      ]),
    }))
  })
})
