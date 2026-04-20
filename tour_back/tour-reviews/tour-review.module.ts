import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourReview } from './entities/tour-review.entity';
import { Tour } from '../tours/entities/tour.entity';
import { TourReviewsService } from './tour-review.service';
import { TourReviewsController } from './tour-review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TourReview, Tour])],
  controllers: [TourReviewsController],
  providers: [TourReviewsService],
})
export class TourReviewsModule {}
