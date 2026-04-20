import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enum/user-role.enum';
import { GuidesService } from '../guides/guides.service';
import { DataSource, Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { TouristsService } from '../tourist-profiles/tourist.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(  
    private readonly usersService: UsersService,
    private readonly guidesService: GuidesService,
    private readonly jwtService: JwtService,
    private readonly touristsService: TouristsService,
    private readonly dataSource: DataSource,
   @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  private async buildAuthResponse(user: User) {
    const payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refresh_token = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' });
    await this.usersService.update(user.id, { refreshToken: refresh_token });
    const { password, refreshToken, ...safeUser } = user;
    return {
      access_token,
      refresh_token,
      user: safeUser,
    };
  }



  // 🔹 REGISTER
async register(data: RegisterDto) {
  const { email, phone, role, password, name, avatarUrl } = data;
  if (!email && !phone)
    throw new ConflictException('Email or phone is required');
  const existing = await this.userRepository
    .createQueryBuilder('user')
    .where(email ? 'user.email = :email' : '1=0', { email })
    .orWhere(phone ? 'user.phone = :phone' : '1=0', { phone })
    .getOne();

  if (existing)
    throw new ConflictException('This email or phone is already taken');

  if (![UserRole.GUIDE, UserRole.TOURIST].includes(role)) {
    throw new ForbiddenException('You cannot register with this role');
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = queryRunner.manager.create(User, {
      email,
      phone,
      name,
      role,
      avatarUrl,
      password: hashedPassword,
    });

    await queryRunner.manager.save(user);

    if (role === UserRole.GUIDE) {
      const guideProfile = this.guidesService.buildGuideEntity({
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        price: 0,
        bio: '',
        schedule: '',
        availableSeats: 0,
        userId: user.id,
      });
      await queryRunner.manager.save(guideProfile);
    } else if (role === UserRole.TOURIST) {
      const touristProfile = this.touristsService.buildTouristEntity({
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        userId: user.id,
      });
      await queryRunner.manager.save(touristProfile);
    }

    await queryRunner.commitTransaction();
    return this.buildAuthResponse(user);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new InternalServerErrorException(`Registration failed: ${error.message}`);
  } finally {
    await queryRunner.release();
  }
}









  // 🔹 LOGIN
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }




  
  // 🔹 REFRESH TOKEN
  async refreshToken(oldToken: string) {
    const payload = this.jwtService.verify(oldToken, { ignoreExpiration: true });
    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.refreshToken !== oldToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const newAccess = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '15m' });
    return { access_token: newAccess };
  }






// Change Password
 async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const valid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!valid) throw new UnauthorizedException('Old password incorrect');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(user.id, { password: hashed });
    return { message: 'Password updated successfully' };
  }





// Forgot Password
 async sendResetPasswordEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '10m' },);
    return {
      message: 'Password reset link sent successfully',
      resetToken,
    };
  }





// Logout
    async logout(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found or already logged out');
    }
    await this.usersService.update(userId, { refreshToken: undefined })
    return { message: 'Logged out successfully' };
  }





}
