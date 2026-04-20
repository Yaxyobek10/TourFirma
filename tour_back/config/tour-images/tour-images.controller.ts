import { Controller, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { TourImagesService } from './tour-images.service';
import { CreateTourImageDto } from './dto/create-tour-image.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '../../common/enum/user-role.enum';

@ApiTags('Tour Images')
@ApiBearerAuth()
@Controller('tours/:id/images')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TOURFIRMA)
export class TourImagesController {
  constructor(private readonly tourImagesService: TourImagesService) {}

  @Post()
  @ApiBody({ type: CreateTourImageDto })
  addImage(
    @Param('id', ParseIntPipe) tourId: number,
    @Body() body: CreateTourImageDto,
  ) {
    return this.tourImagesService.addImage(tourId, body.url, body.isMain);
  }





  
  @Patch(':imageId/set-main')
  @ApiParam({ name: 'imageId', type: Number, example: 5 })
  setMainImage(
    @Param('id', ParseIntPipe) tourId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.tourImagesService.setMainImage(tourId, imageId);
  }
}
