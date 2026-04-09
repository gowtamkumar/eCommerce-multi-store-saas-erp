import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(MailService.name)

  constructor(
    private configService: ConfigService,
    private tenantRepo: TenantRepository,
    private settingsService: SettingsService,
    private cacheService: CacheService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    })
  }

  private async getTransporter(tenantId: string) {
    this.logger.log(`${this.getTransporter.name} Service Called`)
    if (!tenantId)
      return {
        transporter: this.transporter,
        from: this.configService.get<string>('SMTP_FROM', 'noreply@example.com'),
      }

    const settings = await this.settingsService.findByTenantSettings(tenantId)
    if (settings && settings.smtp && settings.smtp.host && settings.smtp.user) {
      const port = Number(settings.smtp.port) || 587

      const tenantTransporter = nodemailer.createTransport({
        host: settings.smtp.host,
        port: port,
        secure: port === 465, // force true for port 465 to avoid socket close errors
        auth: {
          user: settings.smtp.user,
          pass: settings.smtp.pass,
        },
      })
      return { transporter: tenantTransporter, from: settings.smtp.from || settings.smtp.user }
    }

    return {
      transporter: this.transporter,
      from: this.configService.get<string>('SMTP_FROM', 'noreply@example.com'),
    }
  }

  async sendVerificationEmail(email: string, token: string, tenantId: string) {
    this.logger.log(`${this.sendVerificationEmail.name} Service Called`)
    const baseUrl = await this.getTenantBaseUrl(tenantId)
    const verificationLink = `${baseUrl}/verify-email?token=${token}`

    const { transporter, from } = await this.getTransporter(tenantId)

    const mailOptions = {
      from: from,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      this.logger.log(`Verification email sent to ${email}`)
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error)
    }
  }

  async sendResetPasswordEmail(email: string, token: string, tenantId: string) {
    this.logger.log(`${this.sendResetPasswordEmail.name} Service Called`)
    const baseUrl = await this.getTenantBaseUrl(tenantId)
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    const { transporter, from } = await this.getTransporter(tenantId)

    const mailOptions = {
      from: from,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link to complete the process:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      this.logger.log(`Password reset email sent to ${email}`)
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error)
    }
  }

  async sendStaffInvitationEmail(email: string, token: string, role: string, tenantId: string) {
    this.logger.log(`${this.sendStaffInvitationEmail.name} Service Called`)
    const baseUrl = await this.getTenantBaseUrl(tenantId)
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`

    const { transporter, from } = await this.getTransporter(tenantId)

    const mailOptions = {
      from: from,
      to: email,
      subject: "You've been invited to join the team",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e293b;">Team Invitation</h1>
          <p>You have been invited to join as a <strong>${role}</strong>.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
            Accept Invitation
          </a>
          <p style="color: #64748b; font-size: 14px;">This invitation link will expire in 48 hours.</p>
          <p style="color: #64748b; font-size: 14px;">If you didn't expect this invitation, please ignore this email.</p>
        </div>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      this.logger.log(`Staff invitation email sent to ${email}`)
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}`, error)
    }
  }

  private async getTenantBaseUrl(tenantId: string): Promise<string> {
    this.logger.log(`${this.getTenantBaseUrl.name} Service Called for tenant: ${tenantId}`)
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000')

    if (!tenantId) return appUrl

    return this.cacheService.rememberCache(
      `tenant:${tenantId}:baseurl`,
      async () => {
        const tenant = await this.tenantRepo.findById(tenantId)
        if (!tenant) return appUrl

        if (tenant.customDomain) {
          const protocol = appUrl.startsWith('https') ? 'https' : 'http'
          return `${protocol}://${tenant.customDomain}`
        }

        try {
          const url = new URL(appUrl)
          url.hostname = `${tenant.subdomain}.${url.hostname}`
          // Remove trailing slash if present
          return url.toString().replace(/\/$/, '')
        } catch (e) {
          return appUrl
        }
      },
      3600, // 1 hour
      tenantId
    )
  }

  async sendNewOrderNotification(order: OrderEntity, tenantId: string) {
    this.logger.log(`${this.sendNewOrderNotification.name} Service Called for order: ${order.id}`)
    const settings = await this.settingsService.findByTenantSettings(tenantId)
    if (!settings || !settings.contactEmail) {
      this.logger.warn(`No contact email configured for tenant ${tenantId}. Skipping notification.`)
      return
    }

    const { transporter, from } = await this.getTransporter(tenantId)

    // Prepare item list for email
    const itemsHtml =
      order.items
        ?.map((item) => {
          const variantName = item.variant?.combination
            ? Object.values(item.variant.combination).join(' / ')
            : ''
          const displayName = `${item.product?.name || 'Product'} ${variantName ? '(' + variantName + ')' : ''}`

          return `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #edf2f7;">${displayName}</td>
              <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #edf2f7; text-align: right;">${order.currency} ${Number(item.unitPrice).toFixed(2)}</td>
            </tr>
          `
        })
        .join('') || 'No items'

    const mailOptions = {
      from: from,
      to: settings.contactEmail,
      subject: `New Order Received: #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a202c;">
          <h1 style="color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 12px;">New Order Placed</h1>
          <p>A new order has been received on your store.</p>
          
          <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4a5568;">Order Details</h3>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p><strong>Total Amount:</strong> ${order.currency} ${Number(order.totalAmount).toFixed(2)}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="color: #4a5568;">Customer Information</h3>
            <p><strong>Name:</strong> ${order.customerName}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
            <p><strong>Address:</strong> ${order.address}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead style="background-color: #f7fafc;">
              <tr>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #edf2f7; color: #4a5568;">Item</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #edf2f7; color: #4a5568;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #edf2f7; color: #4a5568;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold;">${order.currency} ${Number(order.totalAmount).toFixed(2)}</td>
              </tr>
            </tfoot>

          </table>

          <p style="color: #718096; font-size: 14px; margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px;">
            This is an automated notification. Please log in to your admin dashboard to manage the order.
          </p>
        </div>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      this.logger.log(`New order notification sent for order #${order.id}`)
    } catch (error) {
      this.logger.error(`Failed to send order notification for order #${order.id}`, error)
    }
  }
}
