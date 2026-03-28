import { Module } from '@nestjs/common'
import { AuditLogController } from './audit-log.controller'
import { AuditLogService } from './audit-log.service'

@Module({
  imports: [],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService], // export so any other module can inject it
})
export class AuditLogModule {}
