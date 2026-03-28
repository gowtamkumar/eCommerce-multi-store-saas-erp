import { UserService } from './services/user.service'
import { UserController } from './controllers/user.controller'
import { Module } from '@nestjs/common'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { UserRepository } from './repositories/user.repository'
import { StaffInvitationRepository } from './repositories/staff-invitation.repository'

@Module({
  imports: [MailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, StaffInvitationRepository],
  exports: [UserService, UserRepository, StaffInvitationRepository],
})
export class UserModule {}
