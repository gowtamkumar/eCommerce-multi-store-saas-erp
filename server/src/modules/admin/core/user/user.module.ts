import { UserService } from './services/user.service'
import { UserController } from './controllers/user.controller'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { StaffInvitationEntity } from './entities/staff-invitation.entity'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, StaffInvitationEntity]), MailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
