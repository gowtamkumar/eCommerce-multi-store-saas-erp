import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { FilterUserDto } from '../dtos'
import { UserEntity } from '../entities/user.entity'

@Injectable()
export class UserRepository extends BaseStoreRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repo: Repository<UserEntity>,
  ) {
    super(UserEntity, repo)
  }

  async find(options?: FindManyOptions<UserEntity>): Promise<UserEntity[]> {
    return this.repo.find(options)
  }

  async findAllWithFilters(
    filterUserDto: FilterUserDto,
    storeId: string,
  ): Promise<[UserEntity[], number]> {
    const { name, username, status, page, limit, q } = filterUserDto
    const query = this.repo
      .createQueryBuilder('user')
      .where('user.storeId = :storeId', { storeId })

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` })
    }
    if (username) {
      query.andWhere('user.username = :username', { username })
    }
    if (status) {
      query.andWhere('user.status = :status', { status })
    }
    if (q) {
      query.andWhere('(user.name ILIKE :q OR user.email ILIKE :q)', { q: `%${q}%` })
    }

    return await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        storeId: true,
        isEmailVerified: true,
        roleId: true,
        companyName: true,
        customerCode: true,
        taxId: true,
        creditLimit: true,
        creditHold: true,
        priceBookCode: true,
        branchId: true,
        warehouseId: true,
      },
      relations: {
        roleEntity: {
          permissions: true,
        },
      },
    })
  }

  async findByIdAndStore(id: string, storeId: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { id, storeId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        storeId: true,
        isEmailVerified: true,
        roleId: true,
        companyName: true,
        customerCode: true,
        taxId: true,
        creditLimit: true,
        creditHold: true,
        priceBookCode: true,
        branchId: true,
        warehouseId: true,
      },
      relations: {
        roleEntity: {
          permissions: true,
        },
      },
    })
  }

  async findByUsername(username: string, storeId?: string): Promise<UserEntity | null> {
    const where: { username: string; storeId?: string } = { username }
    if (storeId) where.storeId = storeId
    return this.repo.findOne({ where })
  }

  async findByEmail(email: string, storeId?: string): Promise<UserEntity | null> {
    const where: { email: string; storeId?: string } = { email }
    if (storeId) where.storeId = storeId
    return this.repo.findOne({ where })
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { emailVerificationToken: token } })
  }

  async findByResetToken(token: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { resetPasswordToken: token } })
  }

  async createAndSave(data: Partial<UserEntity>, ctx: RequestContextDto): Promise<UserEntity> {
    const user = this.repo.create({
      ...data,
      storeId: data.storeId || ctx.storeId,
    } as UserEntity)
    return this.repo.save(user)
  }

  async updateAndSave(user: UserEntity, data: Partial<UserEntity>): Promise<UserEntity> {
    this.repo.merge(user, data)
    return this.repo.save(user)
  }

  async deleteUser(user: UserEntity): Promise<UserEntity> {
    return this.repo.softRemove(user)
  }

  async countByStore(storeId: string): Promise<number> {
    return this.repo.count({ where: { storeId } })
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.repo.update(userId, { refreshToken } as any)
  }

  async findUserWithRefreshToken(userId: string): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :userId', { userId })
      .getOne()
  }

  async getOverviewStats(): Promise<{
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
  }> {
    const stats = await this.repo
      .createQueryBuilder('user')
      .select('COUNT(*)', 'totalUsers')
      .addSelect(`COUNT(*) FILTER (WHERE user.status = :active)`, 'activeUsers')
      .addSelect(`COUNT(*) FILTER (WHERE user.status = :inactive)`, 'inactiveUsers')
      .setParameters({ active: UserStatus.ACTIVE, inactive: UserStatus.INACTIVE })
      .getRawOne()

    return {
      totalUsers: parseInt(stats.totalUsers, 10) || 0,
      activeUsers: parseInt(stats.activeUsers, 10) || 0,
      inactiveUsers: parseInt(stats.inactiveUsers, 10) || 0,
    }
  }

  async findTeamMembers(storeId: string): Promise<UserEntity[]> {
    return this.repo.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        image: true,
        createdAt: true,
      },
    })
  }
}
