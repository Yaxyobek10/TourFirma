import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  a
  async create(data: CreateUserDto) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }


async findAll(query: GetUsersQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit ?? 20, 100); 
    const skip = (page - 1) * limit;
    const search = query.search?.trim();
    const qb = this.userRepository.createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.phone',
        'user.avatarUrl',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (search) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },);
    }
    const [users, total] = await qb.getManyAndCount();
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }




  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }


  async update(id: number, data: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, data);
    return this.userRepository.save(user);
  }


  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }


  async deactivate(id: number) {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.userRepository.save(user);
  }

async findByEmail(email: string): Promise<User | null> {
  return this.userRepository.findOne({
    where: { email },
    select: [
      'id',
      'name',
      'email',
      'role',
      'phone',
      'avatarUrl',
      'password',       // 🔥 passwordni select qilamiz
      'refreshToken',
    ],
  });
}

}

