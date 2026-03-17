import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import * as nodemailer from 'nodemailer'
import { SiteSettingsEntity } from 'src/modules/settings/entities/site-settings.entity'
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity'
import { Repository } from 'typeorm'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter
  private readonly logger = new Logger(MailService.name)

  constructor(
    private configService: ConfigService,
    @InjectRepository(TenantEntity)
    private tenantRepo: Repository<TenantEntity>,
    @InjectRepository(SiteSettingsEntity)
    private settingsRepo: Repository<SiteSettingsEntity>,
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
      this.logger.log(`${this.getTransporter.name} Service Called`);
    if (!tenantId)
      return {
        transporter: this.transporter,
        from: this.configService.get<string>('SMTP_FROM', 'noreply@example.com'),
      }

    const settings = await this.settingsRepo.findOne({ where: { tenantId } })
    if (settings && settings.smtp && settings.smtp.host && settings.smtp.user) {
      const port = Number(settings.smtp.port) || 587;
      
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
      this.logger.log(`${this.sendVerificationEmail.name} Service Called`);
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
      this.logger.log(`${this.sendResetPasswordEmail.name} Service Called`);
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
    this.logger.log(`${this.sendStaffInvitationEmail.name} Service Called`);
    const baseUrl = await this.getTenantBaseUrl(tenantId);
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;

    const { transporter, from } = await this.getTransporter(tenantId);

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
    };

    try {
      await transporter.sendMail(mailOptions);
      this.logger.log(`Staff invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}`, error);
    }
  }

  private async getTenantBaseUrl(tenantId: string): Promise<string> {
      this.logger.log(`${this.getTenantBaseUrl.name} Service Called`);
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000')

    if (!tenantId) return appUrl

    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } })
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
  }
}
