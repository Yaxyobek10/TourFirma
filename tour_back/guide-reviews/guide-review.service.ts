import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideReview } from './entities/review.entity';
import { CreateGuideReviewDto } from './dto/create-guide-review.dto';
import { Guide } from '../guides/entities/guide.entity';

@Injectable()
export class GuideReviewsService {
  constructor(
    @InjectRepository(GuideReview)
    private readonly reviewRepo: Repository<GuideReview>,
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
  ) {}


  private async recalcGuideRating(guideId: number) {
    const { avg, count } = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.guideId = :guideId', { guideId })
      .getRawOne();

    const guide = await this.guideRepo.findOne({ where: { id: guideId } });
    if (!guide) return;

    guide.rating = avg ? Number(avg) : 0;
    guide.ratingCount = Number(count) || 0;
    await this.guideRepo.save(guide);
  }

 
  async create(userId: number, guideId: number, dto: CreateGuideReviewDto) {
    const guide = await this.guideRepo.findOne({ where: { id: guideId } });
    if (!guide) throw new NotFoundException('Guide not found');

    let review = await this.reviewRepo.findOne({ where: { userId, guideId } });

    if (review) {

      review.rating = dto.rating;
      review.comment = dto.comment;
      review.title = dto.title;
      review.images = dto.images;
    } else {
      review = this.reviewRepo.create({
        ...dto,
        userId,
        guideId,
      });
    }

    const saved = await this.reviewRepo.save(review);
    await this.recalcGuideRating(guideId);
    return saved;
  }





async findByGuide(guideId: number) {
  const reviews = await this.reviewRepo.find({
    where: { guideId },
    relations: ['user'],
    order: { createdAt: 'DESC' },
  });
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  return {
    averageRating: Number(averageRating.toFixed(1)), 
    totalReviews: reviews.length,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      images: r.images,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        fullName: r.user.name,
        avatarUrl: r.user.avatarUrl,
      },
    })),
  };
}






  async update(userId: number, guideId: number, dto: CreateGuideReviewDto) {
    const review = await this.reviewRepo.findOne({ where: { userId, guideId } });
    if (!review) throw new NotFoundException('Review not found');

    Object.assign(review, dto);
    const saved = await this.reviewRepo.save(review);
    await this.recalcGuideRating(guideId);
    return saved;
  }

  async remove(userId: number, guideId: number) {
    const review = await this.reviewRepo.findOne({ where: { userId, guideId } });
    if (!review) throw new NotFoundException('Review not found');

    await this.reviewRepo.remove(review);
    await this.recalcGuideRating(guideId);

    return { message: 'Review deleted successfully' };
  }
}
