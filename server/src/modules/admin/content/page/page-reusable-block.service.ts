import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateReusableBlockDto, UpdateReusableBlockDto } from './dto/page.dto'
import { PageReusableBlockEntity } from './entities/page-reusable-block.entity'
import { PageReusableBlockRepository } from './page-reusable-block.repository'
import { validateAndSanitizeSections } from './utils/page-html-sanitizer.util'

@Injectable()
export class PageReusableBlockService {
  private readonly logger = new Logger(PageReusableBlockService.name)

  constructor(private readonly repo: PageReusableBlockRepository) {}

  private sanitizePayload(payload: any): any {
    if (!payload) {
      throw new BadRequestException('payload is required')
    }
    // Reusable blocks are exactly the same shape as a CustomizerSection (or array).
    const arr = Array.isArray(payload) ? payload : [payload]
    return validateAndSanitizeSections(arr)
  }

  async create(dto: CreateReusableBlockDto, ctx: RequestContextDto): Promise<PageReusableBlockEntity> {
    return this.repo.create(
      {
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category ?? 'block',
        thumbnail: dto.thumbnail ?? null,
        payload: this.sanitizePayload(dto.payload),
      },
      ctx,
    )
  }

  async list(ctx: RequestContextDto): Promise<PageReusableBlockEntity[]> {
    return this.repo.list(ctx)
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<PageReusableBlockEntity> {
    const block = await this.repo.findOne(id, ctx)
    if (!block) throw new NotFoundException('Reusable block not found')
    return block
  }

  async update(
    id: string,
    dto: UpdateReusableBlockDto,
    ctx: RequestContextDto,
  ): Promise<PageReusableBlockEntity> {
    const block = await this.findOne(id, ctx)
    const update: Partial<PageReusableBlockEntity> = {}
    if (dto.name !== undefined) update.name = dto.name
    if (dto.description !== undefined) update.description = dto.description ?? null
    if (dto.category !== undefined) update.category = dto.category
    if (dto.thumbnail !== undefined) update.thumbnail = dto.thumbnail ?? null
    if (dto.payload !== undefined) update.payload = this.sanitizePayload(dto.payload)
    const saved = await this.repo.update(block.id, update, ctx)
    if (!saved) throw new NotFoundException('Reusable block not found')
    return saved
  }

  async remove(id: string, ctx: RequestContextDto): Promise<{ success: boolean; message: string }> {
    const ok = await this.repo.remove(id, ctx)
    if (!ok) throw new NotFoundException('Reusable block not found')
    return { success: true, message: 'Reusable block deleted' }
  }
}
