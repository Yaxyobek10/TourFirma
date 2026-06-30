import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { sub: number; role?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: Number(payload.sub) },
    });

    return {
      id: user?.id ?? Number(payload.sub),
      email: user?.email,
      role: user?.role ?? payload.role,
      roles: user?.role ? [user.role] : payload.role ? [payload.role] : [],
    };
  }
}
