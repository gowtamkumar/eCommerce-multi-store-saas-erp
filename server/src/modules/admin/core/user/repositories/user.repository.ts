import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { UserEntity } from '../entities/user.entity'
import { FilterUserDto } from '../dtos'
import { UserStatus } from '@/common/enums/user/user-status.enum'

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager())
  }

  async findAllWithFilters(
    filterUserDto: FilterUserDto,
    tenantId: string,
  ): Promise<[UserEntity[], number]> {
    const { name, username, status, page, limit, q } = filterUserDto
    const query = this.createQueryBuilder('user').where('user.tenantId = :tenantId', { tenantId })

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

  async findAllCrossTenant(): Promise<UserEntity[]> {
    return this.find({
      relations: ['tenant'],
    })
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.findOne({ where: { id } })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<UserEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async findByUsername(username: string, tenantId?: string): Promise<UserEntity | null> {
    const where: { username: string; tenantId?: string } = { username }
    if (tenantId) where.tenantId = tenantId
    return this.findOne({ where })
  }

  async findByEmail(email: string, tenantId?: string): Promise<UserEntity | null> {
    const where: { email: string; tenantId?: string } = { email }
    if (tenantId) where.tenantId = tenantId
    return this.findOne({ where })
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    return this.findOne({ where: { emailVerificationToken: token } })
  }

  async findByResetToken(token: string): Promise<UserEntity | null> {
    return this.findOne({ where: { resetPasswordToken: token } })
  }

  async createAndSave(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.create(data as UserEntity)
    return this.save(user)
  }

  async updateAndSave(user: UserEntity, data: Partial<UserEntity>): Promise<UserEntity> {
    this.merge(user, data)
    return this.save(user)
  }

  async deleteUser(user: UserEntity): Promise<UserEntity> {
    return this.remove(user)
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.count({ where: { tenantId } })
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.update(userId, { refreshToken } as any)
  }

  async findUserWithRefreshToken(userId: string): Promise<UserEntity | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :userId', { userId })
      .getOne()
  }

  async getOverviewStats(): Promise<{
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
  }> {
    const totalUsers = await this.count()
    const activeUsers = await this.count({ where: { status: UserStatus.ACTIVE } })
    const inactiveUsers = await this.count({ where: { status: UserStatus.INACTIVE } })
    return { totalUsers, activeUsers, inactiveUsers }
  }

  async findTeamMembers(tenantId: string): Promise<UserEntity[]> {
    return this.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'username', 'email', 'role', 'status', 'image', 'createdAt'],
    })
  }
}
