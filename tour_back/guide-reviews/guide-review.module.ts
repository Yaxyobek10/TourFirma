import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuideReview } from './entities/review.entity';
import { Guide } from '../guides/entities/guide.entity';
import { GuideReviewsService } from './guide-review.service';
import { GuideReviewsController } from './guide-review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GuideReview, Guide])],
  controllers: [GuideReviewsController],
  providers: [GuideReviewsService],
  exports: [GuideReviewsService],
})
export class GuideReviewsModule {}
