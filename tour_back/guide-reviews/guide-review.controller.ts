import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Patch,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GuideReviewsService } from './guide-review.service';
import { CreateGuideReviewDto } from './dto/create.guide-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'tour_back/auth/roles.decarator';
import { UserRole } from 'tour_back/users/entities/user.entity';
import { RolesGuard } from 'tour_back/auth/roles.guard';

@ApiTags('Guide Reviews')
@Controller('guides/:guideId/reviews')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class GuideReviewsController {
  constructor(private readonly guideReviewsService: GuideReviewsService) {}

  @ApiResponse({ status: 200, description: 'List of reviews for this guide' })
  @Get()
  async findAll(@Param('guideId') guideId: string) {
    return this.guideReviewsService.findByGuide(+guideId);
  }


  @Roles(UserRole.TOURIST) 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Review created or updated successfully' })
  @Post()
  async create(
    @Param('guideId') guideId: string,
    @Body() dto: CreateGuideReviewDto,
    @Req() req: any,) {
    return this.guideReviewsService.create(req.user.id, +guideId, dto);
  }



  @Roles(UserRole.TOURIST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Review updated successfully' }) 
  @Patch()
  async update(
    @Param('guideId') guideId: string,
    @Body() dto: CreateGuideReviewDto,
    @Req() req: any,
  ) {
    return this.guideReviewsService.update(req.user.id, +guideId, dto);
  }

  @Roles(UserRole.TOURIST)
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('guideId') guideId: string, @Req() req: any) {
    await this.guideReviewsService.remove(req.user.id, +guideId);
    return;
  }
}



