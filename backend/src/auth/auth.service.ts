import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.services';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      console.log(registerDto);
      const user = await this.usersService.create(registerDto);
      const accessToken = await this.generateAccessToken(user);

      return { user, accessToken };
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await user.comparePassword(password))) {
      return user;
    }

    return null;
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME') || '24h',
    });
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  async refreshToken(user: User): Promise<string> {
    return this.generateAccessToken(user);
  }
}
