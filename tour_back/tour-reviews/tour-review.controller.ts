import { Controller, Post, Get, Body, Param, Req, UseGuards, Query, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TourReviewsService } from './tour-review.service';
import { CreateTourReviewDto } from './dto/create-tour-review.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateReviewDto } from './dto/update-tour-review.dto';

@ApiTags('Tour Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tour-reviews')
export class TourReviewsController {
  constructor(private readonly reviewService: TourReviewsService) {}

  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Post()
  createReview(@Body() dto: CreateTourReviewDto, @Req() req: any) {
    return this.reviewService.createReview(dto, req.user);
  }


  @Get('user/me')
  @ApiOperation({ summary: 'Foydalanuvchining o\'z reviewlarini olish' })
  @Roles(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN)
  async getMyReviews(@Req() req: any) {
    const userId = req.user.id;
    return this.reviewService.getUserReviews(userId);
  }





@Get(':tourId')
async getReviewsByTour(
  @Param('tourId', ParseIntPipe) tourId: number,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('rating') rating?: number,
) {
  return this.reviewService.getReviewsByTour(+tourId, +page, +limit, rating ? +rating : undefined);
}



  @Patch(':id')
  @ApiOperation({ summary: 'Reviewni yangilash' })
  @ApiParam({ name: 'id', example: 5 })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.reviewService.updateReview(id, userId, dto);
  }



  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reviewni o\'chirish' })
  @ApiParam({ name: 'id', example: 7 })
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    return this.reviewService.deleteReview(id, userId, isAdmin);
  }


}



