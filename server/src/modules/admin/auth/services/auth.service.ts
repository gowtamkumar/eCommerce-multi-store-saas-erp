import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { UserDto } from '../../user/dtos/user.dto';
import { UserService } from '../../user/services/user.service';
import { LoginCredentialDto, RegisterCredentialDto } from '../dtos';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerCredentialDto: RegisterCredentialDto, tenantId: string) {
    this.logger.log(`${this.register.name} Service Called`);

    const { username, email } = registerCredentialDto;
    const findByUsername = await this.userService.findUserByUsername(username, tenantId);
    if (findByUsername) {
      throw new ConflictException('Username already exists for this tenant');
    }

    const findByEmail = await this.userService.findUserByEmail(email, tenantId);
    if (findByEmail) {
      throw new ConflictException('Email already exists for this tenant');
    }

    const user = await this.userService.createUser(
      registerCredentialDto,
      tenantId,
    );
    const token = this.generatedSignedJwt(user);

    return { token, user };
  }

  async login(loginCredentialsDto: LoginCredentialDto, tenantId: string) {
    this.logger.log(`${this.login.name} Service Called`);

    const { username, password } = loginCredentialsDto;

    const user = await this.userService.findUserByUsername(username, tenantId);

    const valid = user
      ? await this.userService.validateUser(user, password)
      : false;

    if (!valid) {
      throw new UnauthorizedException('Invalid Login Credentials');
    }

    const token = this.generatedSignedJwt(user);

    return {
      user,
      token,
    };
  }

  async getMe(user: UserDto) {
    this.logger.log(`${this.getMe.name} Service Called`);
    return user;
  }

  async verifyEmail(userId: string) {
    return this.userService.verifyUser(userId);
  }

  private generatedSignedJwt(user) {
    const jwtSignOptions: JwtSignOptions = {
      subject: user.id,
    };
    const payload = {
      username: user.username,
      tenantId: user.tenantId,
      role: user.role
    };
    return this.jwtService.sign(payload, jwtSignOptions);
  }
}
