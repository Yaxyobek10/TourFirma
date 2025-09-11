import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuideReview } from './entities/review.entity';
import { CreateGuideReviewDto } from './dto/create.guide-review.dto';
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
    const { avg } = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.guideId = :guideId', { guideId })
      .getRawOne();
    const guide = await this.guideRepo.findOne({ where: { id: guideId } });
    if (!guide) return;
    guide.rating = avg ? Number(avg) : 0;
    await this.guideRepo.save(guide);
  }




  async create(userId: number, guideId: number, dto: CreateGuideReviewDto) {
    const guide = await this.guideRepo.findOne({ where: { id: guideId } });
    if (!guide) throw new NotFoundException('Guide not found');
    let review = await this.reviewRepo.findOne({
      where: { userId, guideId },
    });
    if (review) {
      review.rating = dto.rating;
      review.comment = dto.comment;
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
    return this.reviewRepo.find({
      where: { guideId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }




  async update(userId: number, guideId: number, dto: CreateGuideReviewDto) {
    const review = await this.reviewRepo.findOne({ where: { userId, guideId } });
    if (!review) throw new NotFoundException('Review not found');
    review.rating = dto.rating;
    review.comment = dto.comment;
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
