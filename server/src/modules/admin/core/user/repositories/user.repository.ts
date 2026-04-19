import { UserStatus } from '@/common/enums/user/user-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FilterUserDto } from '../dtos'
import { UserEntity } from '../entities/user.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) { }

  async findAllWithFilters(
    filterUserDto: FilterUserDto,
    tenantId: string,
  ): Promise<[UserEntity[], number]> {
    const { name, username, status, page, limit, q } = filterUserDto
    const query = this.repo.createQueryBuilder('user').where('user.tenantId = :tenantId', { tenantId })

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

  async findAllCrossTenant(filterDto: FilterUserDto): Promise<[UserEntity[], number]> {
    const { page = 1, limit = 10, q, role, status } = filterDto
    const query = this.repo.createQueryBuilder('user')
      .leftJoinAndSelect('user.tenant', 'tenant')

    if (q) {
      query.andWhere('(user.name ILIKE :q OR user.email ILIKE :q OR user.username ILIKE :q)', { q: `%${q}%` })
    }

    if (role) {
      query.andWhere('user.role = :role', { role })
    }

    if (status) {
      query.andWhere('user.status = :status', { status })
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
      select: ['id', 'name', 'username', 'email', 'phone', 'address', 'image', 'role', 'status', 'createdAt', 'tenantId', 'isEmailVerified']
    })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<UserEntity | null> {
    return this.repo.findOne({ 
      where: { id, tenantId },
      select: ['id', 'name', 'username', 'email', 'phone', 'address', 'image', 'role', 'status', 'createdAt', 'tenantId', 'isEmailVerified']
    })
  }

  async findByUsername(username: string, tenantId?: string): Promise<UserEntity | null> {
    const where: { username: string; tenantId?: string } = { username }
    if (tenantId) where.tenantId = tenantId
    return this.repo.findOne({ where })
  }

  async findByEmail(email: string, tenantId?: string): Promise<UserEntity | null> {
    const where: { email: string; tenantId?: string } = { email }
    if (tenantId) where.tenantId = tenantId
    return this.repo.findOne({ where })
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { emailVerificationToken: token } })
  }

  async findByResetToken(token: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { resetPasswordToken: token } })
  }

  async createAndSave(data: Partial<UserEntity>, ctx: RequestContextDto): Promise<UserEntity> {
    const user = this.repo.create({ ...data, tenantId: data.tenantId || ctx.tenantId } as UserEntity)
    return this.repo.save(user)
  }

  async updateAndSave(user: UserEntity, data: Partial<UserEntity>): Promise<UserEntity> {
    this.repo.merge(user, data)
    return this.repo.save(user)
  }

  async deleteUser(user: UserEntity): Promise<UserEntity> {
    return this.repo.softRemove(user)
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } })
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.repo.update(userId, { refreshToken } as any)
  }

  async findUserWithRefreshToken(userId: string): Promise<UserEntity | null> {
    return this.repo.createQueryBuilder('user')
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

  async findTeamMembers(tenantId: string): Promise<UserEntity[]> {
    return this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'username', 'email', 'role', 'status', 'image', 'createdAt'],
    })
  }

}
