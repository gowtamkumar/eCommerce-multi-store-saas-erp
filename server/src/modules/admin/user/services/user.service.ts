import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  FilterUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from '../dtos';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) { }

  async getUsers(filterUserDto: FilterUserDto, tenantId: string): Promise<{ users: UserEntity[], total: number }> {
    this.logger.log(`${this.getUsers.name} Service Called`);
    const { name, username, status, page, limit, q } = filterUserDto;
    const query = this.userRepo.createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId });

    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }
    if (username) {
      query.andWhere('user.username = :username', { username });
    }
    if (status) {
      query.andWhere('user.status = :status', { status });
    }
    if (q) {
      query.andWhere('(user.name ILIKE :q OR user.email ILIKE :q)', { q: `%${q}%` });
    }

    const [users, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  async findAllUsersCrossTenant(): Promise<UserEntity[]> {
    this.logger.log(`${this.findAllUsersCrossTenant.name} Service Called`);
    return this.userRepo.find({
      relations: ['tenant'],
    });
  }

  async getUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.getUser.name} Service Called`);

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`);
    }
    return user;
  }

  async findUserById(id: string) {
    this.logger.log(`${this.findUserById.name} Service Called`);

    return this.userRepo.findOne({ where: { id } });
  }

  async findUserByUsername(username: string, tenantId?: string) {
    this.logger.log(`${this.findUserByUsername.name} Service Called`);
    const where: any = { username };
    if (tenantId) where.tenantId = tenantId;
    return this.userRepo.findOne({ where });
  }

  async findUserByEmail(email: string, tenantId?: string) {
    this.logger.log(`${this.findUserByEmail.name} Service Called`);
    const where: any = { email };
    if (tenantId) where.tenantId = tenantId;
    return this.userRepo.findOne({ where });
  }

  async createUser(createUserDto: any, tenantId?: string): Promise<UserEntity> {
    this.logger.log(`${this.createUser.name} Service Called`);

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepo.create({
      ...(createUserDto as any),
      password: hashPassword,
      tenantId,
    } as any) as any as UserEntity;
    await this.userRepo.save(user);
    delete (user as any).password;
    return user;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    this.logger.log(`${this.updateUser.name} Service Called`);

    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`);
    }
    this.userRepo.merge(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserEntity> {
    this.logger.log(`${this.updatePassword.name} Service Called`);

    const { currentPassword, newPassword } = updatePasswordDto;

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`);
    }
    const valid = await this.validateUser(user, currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Password is not valid');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return this.userRepo.save(user);
  }

  async resetPassword(id: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetPassword.name} Service Called`);

    const user = await this.getUser(id);
    user.password = await bcrypt.hash(password, 10);
    return this.userRepo.save(user);
  }

  async deleteUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.deleteUser.name} Service Called`);

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User of id ${id} not found`);
    }
    return this.userRepo.remove(user);
  }

  validateUser(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async verifyUser(id: string): Promise<UserEntity> {
    const user = await this.getUser(id);
    user.isEmailVerified = true;
    return this.userRepo.save(user);
  }

  async verifyUserByToken(token: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { emailVerificationToken: token } });
    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    return this.userRepo.save(user);
  }

  async updateResetToken(userId: string, token: string, expires: Date) {
    const user = await this.getUser(userId);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    return this.userRepo.save(user);
  }

  async resetUserPasswordByToken(token: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    return this.userRepo.save(user);
  }

  async countByTenant(tenantId: string) {
    return await this.userRepo.count({ where: { tenantId } });
  }
}
