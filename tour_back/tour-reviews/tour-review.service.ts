import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourReview } from './entities/tour-review.entity';
import { CreateTourReviewDto } from './dto/create-tour-review.dto';
import { Tour } from '../tours/entities/tour.entity';
import { User } from '../users/entities/user.entity';
import { UpdateReviewDto } from './dto/update-tour-review.dto';
import { Redis } from 'ioredis';

@Injectable()
export class TourReviewsService {
  private readonly redis: Redis;
  constructor(
    @InjectRepository(TourReview)
    private readonly reviewRepo: Repository<TourReview>,
    @InjectRepository(Tour)
    private readonly tourRepo: Repository<Tour> ) {
  }



  async createReview(dto: CreateTourReviewDto, user: User) {
    const tour = await this.tourRepo.findOne({ where: { id: dto.tourId } });
    if (!tour) {
      throw new NotFoundException('Tour topilmadi');
    }
    const existing = await this.reviewRepo.findOne({
      where: { tour: { id: dto.tourId }, user: { id: user.id } },
    });
    if (existing) {
      throw new BadRequestException('Siz bu turga allaqachon baho bergansiz');
    }
    const review = this.reviewRepo.create({
      rating: dto.rating,
      comment: dto.comment,
      tour,
      user,
    });
    await this.reviewRepo.save(review);
    tour.totalReviews += 1;
    tour.totalRating += dto.rating;
    tour.rating = Number((tour.totalRating / tour.totalReviews).toFixed(2));
    await this.tourRepo.save(tour);
    return {
      message: 'Fikr muvaffaqiyatli saqlandi',
      averageRating: tour.rating,
      totalReviews: tour.totalReviews,
    };
  }




  async getReviewsByTour(tourId: number, page = 1, limit = 10, rating?: number) {
    const cacheKey = `reviews:${tourId}:page=${page}:limit=${limit}:rating=${rating ?? 'all'}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    let query = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.tour_id = :tourId', { tourId })
      .orderBy('review.createdAt', 'DESC')
      .select([
        'review.id',
        'review.rating',
        'review.comment',
        'review.createdAt',
        'user.id',
        'user.name',
        'user.avatarUrl',
      ])
      .skip((page - 1) * limit)
      .take(limit);
    if (rating) query = query.andWhere('review.rating = :rating', { rating });
    const [reviews, total] = await query.getManyAndCount();
    const result = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: reviews,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
    return result;
  }



  /** 🔹 3. Foydalanuvchi reviewlari */
  async getUserReviews(userId: number) {
    const reviews = await this.reviewRepo.find({
      where: { user: { id: userId } },
      relations: ['tour'],
      order: { createdAt: 'DESC' },
    });
    return reviews;
  }

  /** 🔹 4. Review yangilash */
  async updateReview(id: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'tour'],
    });
    if (!review) throw new NotFoundException('Review topilmadi');
    if (review.user.id !== userId)
      throw new ForbiddenException('Siz bu reviewni tahrir qila olmaysiz');
    Object.assign(review, dto);
    await this.reviewRepo.save(review);
    await this.updateAverageRating(review.tour.id);
    await this.redis.del(`reviews:${review.tour.id}`);
    return { message: 'Review yangilandi', review };
  }



  /** 🔹 5. Review o‘chirish */
  async deleteReview(id: number, userId: number, isAdmin = false) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'tour'],
    });
    if (!review) throw new NotFoundException('Review topilmadi');
    if (!isAdmin && review.user.id !== userId)
      throw new ForbiddenException('Siz bu reviewni o\' chira olmaysiz');
    await this.reviewRepo.remove(review);
    await this.updateAverageRating(review.tour.id);
    await this.redis.del(`reviews:${review.tour.id}`);
    return { message: 'Review o\'chirildi' };
  }

  /** 🔹 6. Tur uchun o‘rtacha bahoni yangilash */
  async updateAverageRating(tourId: number) {
    const { avg } = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.tour_id = :tourId', { tourId })
      .getRawOne();

    await this.tourRepo.update(tourId, { rating: Number(avg) || 0 });
  }

}
