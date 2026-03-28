import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { Module } from '@nestjs/common'
import { UserController } from './controllers/user.controller'
import { UserService } from './services/user.service'

@Module({
  imports: [MailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
