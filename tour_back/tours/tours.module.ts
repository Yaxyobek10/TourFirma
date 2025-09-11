import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { TourImage } from '../config/tour-images/tour-images.entity/tour.image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, TourImage])],
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}
