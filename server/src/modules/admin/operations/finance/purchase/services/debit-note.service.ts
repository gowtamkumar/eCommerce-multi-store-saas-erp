import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DebitNoteRepository } from '../repositories/debit-note.repository'
import { DebitNoteEntity, DebitNoteStatus } from '../entities/debit-note.entity'
import { CreateDebitNoteDto, UpdateDebitNoteStatusDto } from '../dto/debit-note.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SupplierAPLedgerEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier-ap-ledger.entity'
import { SupplierAPReferenceType } from '@/modules/admin/operations/finance/supplier/enums/supplier-ap-Refernce-type.enum'
import { LedgerEntrySide, JournalType } from '@/common/enums/journal-type.enum'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class DebitNoteService {
  private readonly logger = new Logger(DebitNoteService.name)

  constructor(
    private readonly repository: DebitNoteRepository,
    @InjectQueue('accounting') private readonly accountingQueue: Queue,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async createDebitNote(dto: CreateDebitNoteDto, ctx: RequestContextDto): Promise<DebitNoteEntity> {
    this.logger.log('Creating Debit Note')
    const tenantId = ctx.tenantId

    const result = await this.repository.createAndSave(
      {
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId || null,
        amount: dto.amount,
        reason: dto.reason || '',
        status: DebitNoteStatus.DRAFT,
      } as any,
      ctx,
    )

    await this.cacheService.delCacheByPattern(`dn:list*`, tenantId)
    return result
  }

  async findAllDebitNotes(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: DebitNoteStatus,
  ): Promise<{
    items: DebitNoteEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `dn:list:p${page}:l${limit}:q${search || ''}:s${status || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findAllByTenant(
          tenantId,
          page,
          limit,
          search,
          status,
        )
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300,
      tenantId,
    )
  }

  async findOneDebitNote(id: string, ctx: RequestContextDto): Promise<DebitNoteEntity> {
    const tenantId = ctx.tenantId
    const dn = await this.repository.findByIdWithRelations(id, tenantId)
    if (!dn) {
      throw new NotFoundException('Debit Note not found')
    }
    return dn
  }

  async updateDebitNoteStatus(
    id: string,
    dto: UpdateDebitNoteStatusDto,
    ctx: RequestContextDto,
  ): Promise<DebitNoteEntity> {
    this.logger.log(`Updating Debit Note Status: ${id} -> ${dto.status}`)
    const tenantId = ctx.tenantId
    const dn = await this.findOneDebitNote(id, ctx)

    if (dn.status === DebitNoteStatus.APPROVED || dn.status === DebitNoteStatus.CANCELLED) {
      throw new BadRequestException(`Cannot change status of an ${dn.status} debit note`)
    }

    if (dto.status === DebitNoteStatus.APPROVED) {
      return await this.approveDebitNote(dn, ctx)
    } else {
      dn.status = dto.status
      const saved = await this.repository.saveDebitNote(dn)
      await this.cacheService.delCacheByPattern(`dn:list*`, tenantId)
      await this.cacheService.delCache(`dn:id:${id}`, tenantId)
      return saved
    }
  }

  private async approveDebitNote(
    dn: DebitNoteEntity,
    ctx: RequestContextDto,
  ): Promise<DebitNoteEntity> {
    const tenantId = ctx.tenantId
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      dn.status = DebitNoteStatus.APPROVED
      const savedDn = await queryRunner.manager.save(DebitNoteEntity, dn)

      // 1. Post to Supplier Accounts Payable Ledger (as Debit, decreasing liability)
      const lastEntry = await queryRunner.manager
        .createQueryBuilder(SupplierAPLedgerEntity, 'ap')
        .setLock('pessimistic_write')
        .where('ap.supplierId = :supplierId', { supplierId: dn.supplierId })
        .andWhere('ap.tenantId = :tenantId', { tenantId })
        .orderBy('ap.createdAt', 'DESC')
        .getOne()

      const balanceAfter = (lastEntry ? Number(lastEntry.balanceAfter) : 0) - Number(dn.amount)

      const entry = queryRunner.manager.create(SupplierAPLedgerEntity, {
        supplierId: dn.supplierId,
        tenantId,
        referenceType: SupplierAPReferenceType.ADJUSTMENT,
        referenceId: dn.id,
        debit: dn.amount,
        credit: 0,
        balanceAfter,
        remarks: `Debit Note approved: ${dn.debitNoteNumber}. Reason: ${dn.reason || 'None'}`,
      })
      await queryRunner.manager.save(entry)

      await queryRunner.commitTransaction()

      await this.accountingQueue.add(
        'post-debit-note-approved',
        {
          ctx,
          payload: {
            debitNoteId: dn.id,
            debitNoteNumber: dn.debitNoteNumber,
            supplierId: dn.supplierId,
            amount: dn.amount,
          },
        },
        { removeOnComplete: true },
      ).catch((err) => {
        this.logger.error(`Failed to queue debit note journal entry: ${err.message}`)
      })

      await this.cacheService.delCacheByPattern(`dn:list*`, tenantId)
      await this.cacheService.delCache(`dn:id:${dn.id}`, tenantId)

      return savedDn
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }
}
