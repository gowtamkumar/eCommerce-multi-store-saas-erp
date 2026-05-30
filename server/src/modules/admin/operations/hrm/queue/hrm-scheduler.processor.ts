import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'
import { EmployeeStatus } from '@/common/enums/hrm/hrm-enums'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { EmployeeEntity } from '../entities/employee.entity'
import { EmployeeDocumentEntity } from '../entities/employee-document.entity'

const DEFAULT_PROBATION_DAYS = 90
const DOCUMENT_EXPIRY_ALERT_DAYS = 30

@Processor('hrm')
export class HrmSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(HrmSchedulerProcessor.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
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
   * (default 90 days from joiningDate) has elapsed.
   */
  private async runProbationAutoConfirm() {
    const em = this.dataSource.manager
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - DEFAULT_PROBATION_DAYS)

    const employees = await em
      .createQueryBuilder(EmployeeEntity, 'e')
      .leftJoinAndSelect('e.user', 'user')
      .where('e.status = :status', { status: EmployeeStatus.PROBATION })
      .andWhere('e.joining_date <= :cutoff', { cutoff })
      .getMany()

    this.logger.log(`Probation auto-confirm: ${employees.length} employee(s) eligible`)

    for (const employee of employees) {
      await em.update(EmployeeEntity, employee.id, { status: EmployeeStatus.ACTIVE })

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

  /**
   * Send alerts for employee documents expiring within the next 30 days.
   */
  private async runDocumentExpiryAlerts() {
    const em = this.dataSource.manager
    const now = new Date()
    const ahead = new Date()
    ahead.setDate(ahead.getDate() + DOCUMENT_EXPIRY_ALERT_DAYS)

    const expiringDocs = await em
      .createQueryBuilder(EmployeeDocumentEntity, 'd')
      .leftJoinAndSelect('d.employee', 'employee')
      .leftJoinAndSelect('employee.user', 'user')
      .where('d.expiryDate IS NOT NULL')
      .andWhere('d.expiryDate >= :now', { now })
      .andWhere('d.expiryDate <= :ahead', { ahead })
      .getMany()

    this.logger.log(`Document expiry alerts: ${expiringDocs.length} document(s) expiring soon`)

    for (const doc of expiringDocs) {
      const employee = doc.employee
      if (!employee?.userId) continue

      try {
        await this.notificationService.createNotification(
          {
            title: 'Document Expiring Soon',
            message: `Your "${doc.documentType}" document expires on ${new Date(doc.expiryDate!).toLocaleDateString()}. Please renew it.`,
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
