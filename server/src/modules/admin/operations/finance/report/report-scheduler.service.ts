import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { StoreRepository } from '@/modules/system/store/store.repository'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SettingsService } from '@/modules/admin/settings/settings.service'

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name)

  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly reportService: ReportService,
    private readonly mailService: MailService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Run every Sunday at midnight
   */
  @Cron('0 0 * * 0')
  async sendWeeklyReportEmails(): Promise<void> {
    this.logger.log('Starting weekly BI report email scheduler job...')
    const stores = await this.storeRepository.find({
      where: { status: StoreStatus.ACTIVE },
      select: { id: true, storeName: true },
    })

    const now = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(now.getDate() - 7)

    const startDateStr = oneWeekAgo.toISOString().split('T')[0]
    const endDateStr = now.toISOString().split('T')[0]

    // Process active stores concurrently in batches of 5 to ensure scalability
    const batchSize = 5
    for (let i = 0; i < stores.length; i += batchSize) {
      const batch = stores.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (store) => {
          try {
            const ctx: RequestContextDto = {
              storeId: store.id,
              user: { id: 'scheduler', username: 'Scheduler', role: 'SUPER_ADMIN' },
            } as any

            const settings = await this.settingsService.findByStoreSettings(ctx)
            if (!settings || !settings.contactEmail) {
              this.logger.warn(`Store ${store.storeName} (${store.id}) has no contact email. Skipping.`)
              return
            }

            // Get P&L metrics
            const pnl = await this.reportService.getProfitLossReport(ctx, startDateStr, endDateStr)
            const dashboard = await this.reportService.getDashboardReport(ctx, 'week')

            // Generate CSV exports
            const salesExport = await this.reportService.exportReport(ctx, 'sales', startDateStr, endDateStr)
            const expenseExport = await this.reportService.exportReport(ctx, 'expenses', startDateStr, endDateStr)

            const htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a202c; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
                <h2 style="color: #2b6cb0; border-bottom: 2px solid #edf2f7; padding-bottom: 12px; margin-top: 0;">Weekly Business intelligence Summary</h2>
                <p>Hello Admin,</p>
                <p>Here is your weekly performance report for <strong>${store.storeName}</strong> from <strong>${startDateStr}</strong> to <strong>${endDateStr}</strong>.</p>
                
                <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #4a5568;">Financial Snapshot</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0;"><strong>Revenue:</strong></td>
                      <td style="text-align: right;">${pnl.revenue?.total ? pnl.revenue.total.toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0;"><strong>Cost of Goods Sold (COGS):</strong></td>
                      <td style="text-align: right;">${pnl.cogs?.total ? pnl.cogs.total.toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;"><strong>Gross Profit:</strong></td>
                      <td style="text-align: right; border-bottom: 1px solid #e2e8f0;">${pnl.grossProfit ? pnl.grossProfit.toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0;"><strong>Operating Expenses:</strong></td>
                      <td style="text-align: right;">${pnl.operatingExpenses?.total ? pnl.operatingExpenses.total.toFixed(2) : '0.00'}</td>
                    </tr>
                    <tr style="font-size: 16px; font-weight: bold;">
                      <td style="padding: 8px 0; color: #2d3748;">Net Profit:</td>
                      <td style="text-align: right; color: ${pnl.netProfit >= 0 ? '#38a169' : '#e53e3e'};">${pnl.netProfit ? pnl.netProfit.toFixed(2) : '0.00'}</td>
                    </tr>
                  </table>
                </div>

                <div style="margin-bottom: 20px;">
                  <h3 style="color: #4a5568; margin-bottom: 8px;">Operations Summary</h3>
                  <ul>
                    <li>Total Orders: ${dashboard.periodOrders || 0}</li>
                    <li>Average Order Value: ${dashboard.avgOrderValue ? dashboard.avgOrderValue.toFixed(2) : '0.00'}</li>
                    <li>Low Stock Items: ${dashboard.lowStockCount || 0}</li>
                  </ul>
                </div>

                <p style="font-size: 14px; color: #718096;">
                  We have attached full CSV exports for your <strong>Sales</strong> and <strong>Expenses</strong> for this week.
                </p>

                <p style="color: #a0aec0; font-size: 12px; margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center;">
                  This is a scheduled report. You can manage your notification preferences in the settings dashboard.
                </p>
              </div>
            `

            // Send a single combined email containing both the HTML summary and attachments (DRY / SoC)
            await this.mailService.sendGenericEmail({
              to: settings.contactEmail,
              subject: `Weekly Performance Report: ${store.storeName}`,
              html: htmlContent,
              storeId: store.id,
              attachments: [
                {
                  filename: salesExport.filename,
                  content: salesExport.csv,
                },
                {
                  filename: expenseExport.filename,
                  content: expenseExport.csv,
                },
              ],
            })

            this.logger.log(`Weekly BI report email sent successfully to ${settings.contactEmail} for store ${store.id}`)
          } catch (error: any) {
            this.logger.error(`Failed to send weekly report email for store ${store.id}: ${error.message}`, error.stack)
          }
        }),
      )
    }
  }
}
