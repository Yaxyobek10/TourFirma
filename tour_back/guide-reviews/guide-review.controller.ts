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
import { CreateGuideReviewDto } from './dto/create-guide-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Guide Reviews')
@Controller('guides/:guideId/reviews')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class GuideReviewsController {
  constructor(private readonly guideReviewsService: GuideReviewsService) {}






  @ApiResponse({ status: 200, description: 'List of reviews for this guide' })
  @ApiParam({ name: 'guideId', type: Number, description: 'Guide ID' })
  @Get()
  async findAll(@Param('guideId') guideId: number) {
    return this.guideReviewsService.findByGuide(guideId);
  }





  @Roles(UserRole.GUIDE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Review created or updated successfully' })
  @ApiParam({ name: 'guideId', type: Number, description: 'Guide ID' })
  @Post()
  async create(
    @Param('guideId') guideId: number,
    @Body() dto: CreateGuideReviewDto,
    @Req() req: any,
  ) {
    return this.guideReviewsService.create(req.user.id, guideId, dto);
  }





  @Roles(UserRole.GUIDE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiParam({ name: 'guideId', type: Number, description: 'Guide ID' })
  @Patch()
  async update(
    @Param('guideId') guideId: number,
    @Body() dto: CreateGuideReviewDto,
    @Req() req: any,
  ) {
    return this.guideReviewsService.update(req.user.id, guideId, dto);
  }




  @Roles(UserRole.GUIDE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiParam({ name: 'guideId', type: Number, description: 'Guide ID' })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('guideId') guideId: number, @Req() req: any) {
    await this.guideReviewsService.remove(req.user.id, guideId);
    return;
  }
}







