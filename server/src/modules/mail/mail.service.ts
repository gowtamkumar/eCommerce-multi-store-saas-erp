import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<boolean>('SMTP_SECURE', false),
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendVerificationEmail(email: string, token: string, tenantId: string) {
        // In a real multi-tenant app, you'd fetch the tenant's custom domain or use a base app URL
        // For now, we'll use a placeholder or config-based URL
        const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
        const verificationLink = `${baseUrl}/verify-email?token=${token}`;

        const mailOptions = {
            from: this.configService.get<string>('SMTP_FROM', 'noreply@example.com'),
            to: email,
            subject: 'Verify Your Email',
            html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Verification email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${email}`, error.stack);
            // Don't throw here to avoid breaking the registration flow, 
            // but in a production app you might want to handle this more robustly.
        }
    }
}
