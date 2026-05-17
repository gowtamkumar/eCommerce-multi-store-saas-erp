import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './controllers/user.controller'
import { UserEntity } from './entities/user.entity'
import { StaffInvitationEntity } from './entities/staff-invitation.entity'
import { UserRepository } from './repositories/user.repository'
import { StaffInvitationRepository } from './repositories/staff-invitation.repository'
import { StaffInvitationService } from './services/staff-invitation.service'
import { UserService } from './services/user.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, StaffInvitationEntity]), MailModule, CacheModule],
  controllers: [UserController],
  providers: [UserService, StaffInvitationService, UserRepository, StaffInvitationRepository],
  exports: [UserService, StaffInvitationService],
})
export class UserModule {}
