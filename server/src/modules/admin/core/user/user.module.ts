import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { Module } from '@nestjs/common'
import { UserController } from './controllers/user.controller'
import { StaffInvitationRepository } from './repositories/staff-invitation.repository'
import { UserRepository } from './repositories/user.repository'
import { UserService } from './services/user.service'

@Module({
  imports: [MailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, StaffInvitationRepository],
  exports: [UserService, UserRepository, StaffInvitationRepository],
})
export class UserModule {}
