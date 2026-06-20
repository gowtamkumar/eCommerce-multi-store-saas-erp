import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { DataSource, In } from 'typeorm'
import { EmployeeStatus } from '@/common/enums/hrm/hrm-enums'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { EmployeeEntity } from '../entities/employee.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { HrmRepository } from '../hrm.repository'

const DEFAULT_PROBATION_DAYS = 90
const DOCUMENT_EXPIRY_ALERT_DAYS = 30

@Processor('hrm')
export class HrmSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(HrmSchedulerProcessor.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly hrmRepo: HrmRepository,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing HRM job ${job.id} (Name: ${job.name})`)

    switch (job.name) {
      case 'probation-auto-confirm':
        await this.runProbationAutoConfirm()
        break
      case 'document-expiry-alerts':
        await this.runDocumentExpiryAlerts()
        break
      default:
        this.logger.warn(`Unknown HRM job name: ${job.name}`)
    }
  }

  /**
   * Promote employees from PROBATION → ACTIVE when their probation period
   * (tenant settings or default 90 days from joiningDate) has elapsed.
   */
  private async runProbationAutoConfirm() {
    const em = this.dataSource.manager

    const employees = await this.hrmRepo.employeeRepo.find({
      where: { status: EmployeeStatus.PROBATION },
      relations: { user: true },
    })

    this.logger.log(`Probation auto-confirm check: ${employees.length} employee(s) currently on probation`)
    if (employees.length === 0) return

    const settingsList = await em.find(SiteSettingsEntity)
    const settingsMap = new Map<string, SiteSettingsEntity>()
    for (const s of settingsList) {
      settingsMap.set(s.tenantId, s)
    }

    const eligibleEmployees: EmployeeEntity[] = []
    const now = new Date()

    for (const employee of employees) {
      const tenantSettings = settingsMap.get(employee.tenantId)
      const probationDays = tenantSettings?.probationDays ?? DEFAULT_PROBATION_DAYS

      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - probationDays)

      if (new Date(employee.joiningDate) <= cutoff) {
        eligibleEmployees.push(employee)
      }
    }

    this.logger.log(`Probation auto-confirm: ${eligibleEmployees.length} employee(s) eligible for promotion`)

    if (eligibleEmployees.length > 0) {
      const eligibleIds = eligibleEmployees.map((e) => e.id)
      await em.update(EmployeeEntity, { id: In(eligibleIds) }, { status: EmployeeStatus.ACTIVE })

      for (const employee of eligibleEmployees) {
        if (employee.userId) {
          try {
            await this.notificationService.createNotification(
              {
                title: 'Probation Completed',
                message: `Congratulations! Your probation period has been completed and your status is now ACTIVE.`,
                type: 'SUCCESS',
                link: '/admin/profile',
                userId: employee.userId,
              },
              employee.tenantId,
            )
          } catch (e: any) {
            this.logger.error(`Failed to notify employee ${employee.id}: ${e.message}`)
          }
        }
      }
    }
  }

  /**
   * Send alerts for employee documents expiring within the next 30 days.
   */
  private async runDocumentExpiryAlerts() {
    const em = this.dataSource.manager

    const settingsList = await em.find(SiteSettingsEntity)
    const settingsMap = new Map<string, SiteSettingsEntity>()
    let maxAlertDays = DOCUMENT_EXPIRY_ALERT_DAYS

    for (const s of settingsList) {
      settingsMap.set(s.tenantId, s)
      const alertDays = s.documentExpiryAlertDays ?? DOCUMENT_EXPIRY_ALERT_DAYS
      if (alertDays > maxAlertDays) {
        maxAlertDays = alertDays
      }
    }

    const expiringDocs = await this.hrmRepo.findExpiringDocuments(maxAlertDays)
    const now = new Date()

    this.logger.log(`Document expiry alerts: found ${expiringDocs.length} total document(s) expiring within ${maxAlertDays} days`)

    for (const doc of expiringDocs) {
      const employee = doc.employee
      if (!employee?.userId) continue

      const tenantSettings = settingsMap.get(doc.tenantId)
      const alertDays = tenantSettings?.documentExpiryAlertDays ?? DOCUMENT_EXPIRY_ALERT_DAYS

      const ahead = new Date()
      ahead.setDate(ahead.getDate() + alertDays)

      const expiryDate = new Date(doc.expiryDate!)
      if (expiryDate >= now && expiryDate <= ahead) {
        try {
          await this.notificationService.createNotification(
            {
              title: 'Document Expiring Soon',
              message: `Your "${doc.documentType}" document expires on ${expiryDate.toLocaleDateString()}. Please renew it.`,
              type: 'WARNING',
              link: '/admin/profile',
              userId: employee.userId,
            },
            doc.tenantId,
          )
        } catch (e: any) {
          this.logger.error(`Failed to send expiry alert for doc ${doc.id}: ${e.message}`)
        }
      }
    }
  }
}
