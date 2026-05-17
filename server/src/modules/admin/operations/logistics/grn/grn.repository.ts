import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { GoodsReceivedNoteEntity } from './entities/grn.entity'
import { GrnItemEntity } from './entities/grn-item.entity'
import { CreateGrnDto } from './dto/grn.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { GrnStatus } from '@/common/enums/grn-status.enum'

@Injectable()
export class GrnRepository {
  constructor(
    @InjectRepository(GoodsReceivedNoteEntity)
    private readonly repository: Repository<GoodsReceivedNoteEntity>,
    @InjectRepository(GrnItemEntity)
    private readonly itemRepository: Repository<GrnItemEntity>,
  ) {}

  async createAndSave(
    dto: CreateGrnDto,
    grnNumber: string,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<GoodsReceivedNoteEntity> {
    const repo = manager ? manager.getRepository(GoodsReceivedNoteEntity) : this.repository

    const grn = repo.create({
      grnNumber,
      poId: dto.poId,
      supplierId: dto.supplierId,
      warehouseId: dto.warehouseId,
      branchId: dto.branchId,
      receivedDate: new Date(),
      receivedByUserId: ctx.userId,
      status: GrnStatus.DRAFT,
      notes: dto.notes,
      tenantId: ctx.tenantId,
      items: dto.items.map((item) => ({
        ...item,
        tenantId: ctx.tenantId,
      })),
    })

    return repo.save(grn)
  }

  async findById(id: string, tenantId: string): Promise<GoodsReceivedNoteEntity> {
    const grn = await this.repository.findOne({
      where: { id, tenantId },
      relations: [
        'items',
        'items.product',
        'items.variant',
        'supplier',
        'warehouse',
        'branch',
        'receivedByUser',
        'purchaseOrder',
      ],
    })

    if (!grn) {
      throw new NotFoundException(`Goods Received Note with ID ${id} not found`)
    }
    return grn
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
    status?: GrnStatus,
  ): Promise<{ items: GoodsReceivedNoteEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('grn')
      .leftJoinAndSelect('grn.supplier', 'supplier')
      .leftJoinAndSelect('grn.warehouse', 'warehouse')
      .where('grn.tenantId = :tenantId', { tenantId })

    if (status) {
      query.andWhere('grn.status = :status', { status })
    }

    query.orderBy('grn.createdAt', 'DESC')

    const page = paginationDto.page || 1
    const limit = paginationDto.limit || 10
    query.skip((page - 1) * limit).take(limit)

    const [items, total] = await query.getManyAndCount()
    return { items, total }
  }

  async save(
    grn: GoodsReceivedNoteEntity,
    manager?: EntityManager,
  ): Promise<GoodsReceivedNoteEntity> {
    const repo = manager ? manager.getRepository(GoodsReceivedNoteEntity) : this.repository
    return repo.save(grn)
  }

  async generateGrnNumber(tenantId: string): Promise<string> {
    const today = new Date()
    const prefix = `GRN-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}-`

    const lastGrn = await this.repository
      .createQueryBuilder('grn')
      .where('grn.tenantId = :tenantId', { tenantId })
      .andWhere('grn.grnNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('grn.grnNumber', 'DESC')
      .getOne()

    let sequence = 1
    if (lastGrn) {
      const lastSeq = parseInt(lastGrn.grnNumber.split('-')[2], 10)
      if (!isNaN(lastSeq)) sequence = lastSeq + 1
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`
  }
}
