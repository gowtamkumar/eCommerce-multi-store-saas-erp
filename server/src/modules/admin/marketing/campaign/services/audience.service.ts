import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class AudienceService {
  private readonly logger = new Logger(AudienceService.name)

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Fetches the audience for a campaign.
   * For the MVP, this returns all active users for the tenant.
   */
  async getAudience(tenantId: string): Promise<UserEntity[]> {
    this.logger.log(`Fetching audience for tenant: ${tenantId}`)

    return this.userRepository.find({
      where: {
        tenantId,
        status: 'active' as any, // Avoiding enum circularity or hard dependency if possible
      },
      select: ['id', 'email', 'phone', 'pushToken', 'fcmToken', 'name'],
    })
  }
}
