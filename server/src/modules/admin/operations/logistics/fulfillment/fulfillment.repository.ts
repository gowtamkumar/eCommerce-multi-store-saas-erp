import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FulfillmentTaskEntity } from './entities/fulfillment-task.entity'
import { FulfillmentItemEntity } from './entities/fulfillment-item.entity'

@Injectable()
export class FulfillmentRepository extends BaseStoreRepository<FulfillmentTaskEntity> {
  constructor(
    @InjectRepository(FulfillmentTaskEntity)
    private readonly taskRepository: Repository<FulfillmentTaskEntity>,
    @InjectRepository(FulfillmentItemEntity)
    private readonly itemRepository: Repository<FulfillmentItemEntity>,
  ) {
    super(FulfillmentTaskEntity, taskRepository)
  }

  async createTask(task: Partial<FulfillmentTaskEntity>): Promise<FulfillmentTaskEntity> {
    const newEntry = this.taskRepository.create(task)
    return this.taskRepository.save(newEntry)
  }

  async findTaskById(id: string, storeId: string): Promise<FulfillmentTaskEntity | null> {
    return this.taskRepository.findOne({
      where: { id, storeId },
      relations: {
        items: {
          product: true,
          variant: true,
          bin: true,
        },
        order: {
          items: true,
        },
      },
    })
  }

  async findAllTasksByStore(storeId: string, status?: string): Promise<FulfillmentTaskEntity[]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.order', 'order')
      .where('task.storeId = :storeId', { storeId })

    if (status) {
      query.andWhere('task.status = :status', { status })
    }

    return query.orderBy('task.createdAt', 'DESC').getMany()
  }

  async updateTask(id: string, update: Partial<FulfillmentTaskEntity>): Promise<void> {
    await this.taskRepository.update(id, update)
  }

  async updateItem(id: string, update: Partial<FulfillmentItemEntity>): Promise<void> {
    await this.itemRepository.update(id, update)
  }
}
