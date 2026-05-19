import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { RbacModule } from './rbac/rbac.module'

@Module({
  imports: [UserModule, AuthModule, RbacModule],
  exports: [UserModule, AuthModule, RbacModule],
})
export class AdminModule {}
