import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create.user.dto';
import { GuidesService } from '../guides/guides.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly guidesService: GuidesService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,) {}

  async register(data: CreateUserDto) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new ConflictException('This email is already taken');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = queryRunner.manager.create(User, {
        ...data,
        password: hashedPassword,
      });
      await queryRunner.manager.save(user);
      if (user.role === UserRole.GUIDE) {
        const guideEntity = this.guidesService.buildGuideEntity({
          name: user.name,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          price: 0,
          bio: '',
          schedule: '',
          userId: user.id,
        });
        await queryRunner.manager.save(guideEntity);
      }
      await queryRunner.commitTransaction();
      return this.buildAuthResponse(user);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Registration failed', err.message);
    } finally {
      await queryRunner.release();
    }
  }



  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
      throw new UnauthorizedException('Invalid email or password');
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
