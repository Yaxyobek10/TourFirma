import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUsersQueryDto } from './dto/query-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @Post()
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }




 @Get()
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @ApiQuery({ name: 'search', required: false, description: 'Ism yoki email bo\'yicha qidiruv' })
  @ApiQuery({ name: 'page', required: false, description: 'Sahifa raqami (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Har sahifadagi elementlar soni (default: 20)', example: 20 })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: GetUsersQueryDto,
  ) {
    return this.usersService.findAll(query);
  }

 
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }


  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, data);
  }


  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }
}




