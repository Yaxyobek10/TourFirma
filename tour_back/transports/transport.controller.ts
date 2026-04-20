import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';
import { ApiBearerAuth, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransportCategory } from './entities/transport.entity';

@ApiTags('Transports')
@ApiBearerAuth()
@Controller('transports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransportController {
  constructor(private readonly transportService: TransportService) {}




  /** CREATE TRANSPORT (TourFirma Only) */
  @Post()
  @Roles(UserRole.TOURFIRMA)
  @ApiBody({ type: CreateTransportDto })
  async create(@Body() dto: CreateTransportDto, @Req() req) {
    return this.transportService.create(dto, req.user.id);
  }





  /** GET ALL TRANSPORTS with query filters and pagination */
@Get()
@Roles(UserRole.TOURFIRMA, UserRole.TOURIST) 
@ApiQuery({ name: 'type', required: false })
@ApiQuery({ name: 'category', required: false, enum: TransportCategory })
@ApiQuery({ name: 'tags', required: false, type: [String] })
@ApiQuery({ name: 'minPrice', required: false, type: Number })
@ApiQuery({ name: 'maxPrice', required: false, type: Number })
@ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD format' })
@ApiQuery({ name: 'skip', required: false, type: Number })
@ApiQuery({ name: 'take', required: false, type: Number })
async findAll(
  @Req() req,
  @Query('type') type?: string,
  @Query('category') category?: TransportCategory,
  @Query('tags') tags?: string[],
  @Query('minPrice') minPrice?: number,
  @Query('maxPrice') maxPrice?: number,
  @Query('date') date?: string,
  @Query('skip') skip?: number,
  @Query('take') take?: number,) {
  const filters = { type, category, tags, minPrice, maxPrice };
  const pagination = {
    skip: Number(skip ?? 0),
    take: Number(take ?? 10),
  };
  return this.transportService.findAll(req.user.id, filters, date, pagination);
}





  /** GET ONE TRANSPORT */
  @Get(':id')
  @Roles(UserRole.TOURFIRMA || UserRole.TOURIST)
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.transportService.findOne(id, req.user.id);
  }






  /** UPDATE TRANSPORT */
  @Patch(':id')
  @Roles(UserRole.TOURFIRMA)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransportDto,
    @Req() req ) {
    return this.transportService.update(id, dto, req.user.id);
  }



  /** SOFT DELETE TRANSPORT */
  @Delete(':id')
  @Roles(UserRole.TOURFIRMA)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.transportService.remove(id, req.user.id);
  }
}

