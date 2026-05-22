import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { DunningRuleEntity } from '../entities/dunning-rule.entity'
import { DunningLogEntity } from '../entities/dunning-log.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { ArLedgerEntity } from '../entities/ar-ledger.entity'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class DunningService {
  private readonly logger = new Logger(DunningService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  // --- Dunning Rules CRUD ---

  async findAllRules(tenantId: string): Promise<DunningRuleEntity[]> {
    return this.dataSource.manager.find(DunningRuleEntity, {
      where: { tenantId },
      order: { dunningLevel: 'ASC' },
    })
  }

  async findRuleById(id: string, tenantId: string): Promise<DunningRuleEntity> {
    const rule = await this.dataSource.manager.findOne(DunningRuleEntity, {
      where: { id, tenantId },
    })
    if (!rule) {
      throw new NotFoundException(`Dunning rule with ID ${id} not found`)
    }
    return rule
  }

  async createRule(data: Partial<DunningRuleEntity>, tenantId: string): Promise<DunningRuleEntity> {
    const em = this.dataSource.manager
    const rule = em.create(DunningRuleEntity, {
      ...data,
      tenantId,
    })
    return em.save(DunningRuleEntity, rule)
  }

  async updateRule(id: string, data: Partial<DunningRuleEntity>, tenantId: string): Promise<DunningRuleEntity> {
    const em = this.dataSource.manager
    const rule = await this.findRuleById(id, tenantId)
    Object.assign(rule, data)
    return em.save(DunningRuleEntity, rule)
  }

  async deleteRule(id: string, tenantId: string): Promise<void> {
    const em = this.dataSource.manager
    const rule = await this.findRuleById(id, tenantId)
    await em.remove(DunningRuleEntity, rule)
  }

  // --- Dunning Notice Logs ---

  async findAllLogs(tenantId: string): Promise<DunningLogEntity[]> {
    return this.dataSource.manager.find(DunningLogEntity, {
      where: { tenantId },
      relations: ['customer', 'dunningRule'],
      order: { createdAt: 'DESC' },
    })
  }

  // --- Dunning Audit Runner ---

  async runDunningAudit(ctx: RequestContextDto): Promise<{ processed: number; logsCreated: number }> {
    const tenantId = ctx.tenantId
    const em = this.dataSource.manager
    const now = new Date()

    // 1. Load active dunning rules for this tenant
    const activeRules = await em.find(DunningRuleEntity, {
      where: { tenantId },
      order: { daysOverdue: 'DESC' }, // Highest days overdue first (most severe first)
    })

    if (activeRules.length === 0) {
      this.logger.log(`No active dunning rules found for tenant ${tenantId}. Audit skipped.`)
      return { processed: 0, logsCreated: 0 }
    }

    // 2. Fetch all customers in this tenant
    const customers = await em.find(UserEntity, {
      where: { tenantId },
    })

    let processedCount = 0
    let logsCreatedCount = 0

    for (const customer of customers) {
      // 3. Get AR ledger entries for customer
      const entries = await em.find(ArLedgerEntity, {
        where: { customerId: customer.id, tenantId },
        order: { createdAt: 'ASC', id: 'ASC' },
      })

      if (entries.length === 0) continue

      const totalOutstanding = entries.reduce((sum, e) => sum + Number(e.amount), 0)
      if (totalOutstanding <= 0) continue // Skip if they do not owe anything

      processedCount++

      // FIFO calculation of unpaid invoices
      const invoices = entries.filter((e) => e.type === ArTransactionType.INVOICE)
      const paymentsTotal = Math.abs(
        entries
          .filter((e) =>
            [ArTransactionType.PAYMENT, ArTransactionType.WRITE_OFF, ArTransactionType.CREDIT_NOTE].includes(
              e.type,
            ),
          )
          .reduce((sum, e) => sum + Number(e.amount), 0),
      )

      let remainingPayment = paymentsTotal
      let oldestUnpaidInvoice: ArLedgerEntity | null = null
      let totalOverdueAmount = 0

      for (const invoice of invoices) {
        const invAmt = Number(invoice.amount)
        let unpaidAmt = invAmt

        if (remainingPayment >= invAmt) {
          remainingPayment -= invAmt
          unpaidAmt = 0
        } else {
          unpaidAmt -= remainingPayment
          remainingPayment = 0
        }

        if (unpaidAmt > 0) {
          const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.createdAt)
          if (!oldestUnpaidInvoice) {
            oldestUnpaidInvoice = invoice
          }
          if (dueDate < now) {
            totalOverdueAmount += unpaidAmt
          }
        }
      }

      if (!oldestUnpaidInvoice || totalOverdueAmount <= 0) continue

      const oldestUnpaidDueDate = oldestUnpaidInvoice.dueDate
        ? new Date(oldestUnpaidInvoice.dueDate)
        : new Date(oldestUnpaidInvoice.createdAt)

      const diffTime = now.getTime() - oldestUnpaidDueDate.getTime()
      const oldestOverdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (oldestOverdueDays <= 0) continue

      // 4. Find highest rule applicable
      const matchedRule = activeRules.find((rule) => oldestOverdueDays >= rule.daysOverdue)
      if (!matchedRule) continue

      // 5. Guard against duplicate notices:
      // Do not send if a dunning log of the same rule/level exists with createdAt after oldestUnpaidDueDate
      const duplicateLog = await em.findOne(DunningLogEntity, {
        where: {
          customerId: customer.id,
          tenantId,
          dunningRuleId: matchedRule.id,
        },
        order: { createdAt: 'DESC' },
      })

      if (duplicateLog && new Date(duplicateLog.createdAt) >= oldestUnpaidDueDate) {
        // Skip duplicate notice for this overdue invoice cycle
        continue
      }

      // 6. Execute action
      const action = matchedRule.action
      const shouldEmail = action === 'EMAIL' || action === 'EMAIL_AND_HOLD'
      const shouldHold = action === 'CREDIT_HOLD' || action === 'EMAIL_AND_HOLD'

      let interpolatedBody = ''
      if (shouldEmail && customer.email) {
        interpolatedBody = this.interpolateTemplate(matchedRule.emailBody, {
          customerName: customer.name,
          companyName: customer.companyName || customer.name,
          daysOverdue: oldestOverdueDays,
          amountOverdue: totalOverdueAmount.toFixed(2),
        })

        try {
          await this.mailService.sendGenericEmail({
            to: customer.email,
            subject: matchedRule.emailSubject,
            html: interpolatedBody,
            tenantId,
          })
        } catch (err) {
          this.logger.error(`Failed to send dunning email to ${customer.email} for customer ${customer.id}`, err)
        }
      }

      if (shouldHold && !customer.creditHold) {
        customer.creditHold = true
        await em.save(UserEntity, customer)
        this.logger.log(`Customer ${customer.id} placed on credit hold via dunning rule level ${matchedRule.dunningLevel}`)
      }

      // 7. Write Log
      const dunningLog = em.create(DunningLogEntity, {
        tenantId,
        customerId: customer.id,
        dunningRuleId: matchedRule.id,
        actionTaken: action,
        recipientEmail: customer.email || 'N/A',
        emailSubject: shouldEmail ? matchedRule.emailSubject : null,
        emailBody: shouldEmail ? interpolatedBody : null,
        triggeredDaysOverdue: oldestOverdueDays,
        triggeredAmountOverdue: totalOverdueAmount,
      })

      await em.save(DunningLogEntity, dunningLog)
      logsCreatedCount++
    }

    return { processed: processedCount, logsCreated: logsCreatedCount }
  }

  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(placeholder, String(value))
    }
    return result
  }
}
