import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        @InjectRepository(AuditLogEntity)
        private readonly auditLogRepository: Repository<AuditLogEntity>,
    ) {}

    /**
     * Programmatically log an action from any service.
     * Errors are swallowed so audit logging never breaks business logic.
     */
    async log(
        tenantId: string,
        dto: CreateAuditLogDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<void> {
        this.logger.log(`${this.log.name} Service Called`);
        try {
            const entry = this.auditLogRepository.create({
                tenantId,
                userId: dto.userId,
                action: dto.action,
                entity: dto.entity,
                entityId: dto.entityId,
                oldValue: dto.oldValue,
                newValue: dto.newValue,
                ipAddress: dto.ipAddress ?? ipAddress,
                userAgent: dto.userAgent ?? userAgent,
            });
            await this.auditLogRepository.save(entry);
        } catch (err) {
            // Never let audit logging break the main request flow
            console.error('[AuditLog] Failed to write audit log:', err?.message);
        }
    }

    /**
     * Paginated list with optional filters — tenant-scoped always.
     */
    async findAllAuditLogs(tenantId: string, query: QueryAuditLogDto) {
        this.logger.log(`${this.findAllAuditLogs.name} Service Called`);
        const { page = 1, limit = 20, userId, action, entity, entityId, from, to } = query;

        const where: FindOptionsWhere<AuditLogEntity> = { tenantId };

        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (entity) where.entity = entity;
        if (entityId) where.entityId = entityId;

        if (from && to) {
            where.createdAt = Between(new Date(from), new Date(to));
        }

        const [data, total] = await this.auditLogRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Single audit log entry — tenant-scoped.
     */
    async findOneAuditLog(id: string, tenantId: string) {
        this.logger.log(`${this.findOneAuditLog.name} Service Called`);
        return this.auditLogRepository.findOne({ where: { id, tenantId } });
    }

    /**
     * Delete all logs older than N days for a tenant (data-retention helper).
     */
    async deleteOlderThanAuditLogs(tenantId: string, days: number) {
        this.logger.log(`${this.deleteOlderThanAuditLogs.name} Service Called`);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        await this.auditLogRepository
            .createQueryBuilder()
            .delete()
            .from(AuditLogEntity)
            .where('tenant_id = :tenantId', { tenantId })
            .andWhere('created_at < :cutoff', { cutoff })
            .execute();

        return { message: `Audit logs older than ${days} days deleted for tenant ${tenantId}` };
    }
}
