import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourImage } from './tour-images.entity/tour.image.entity';
import { Tour } from '../../tours/entities/tour.entity';

@Injectable()
export class TourImagesService {
  constructor(
    @InjectRepository(TourImage)
    private readonly imageRepo: Repository<TourImage>,
    @InjectRepository(Tour)
    private readonly tourRepo: Repository<Tour>,
  ) {}

  async addImage(tourId: number, url: string, isMain = false) {
    const tour = await this.tourRepo.findOne({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour not found');

    if (isMain) {
      await this.imageRepo.update({ tour: { id: tourId } }, { isMain: false });
      tour.coverImage = url;
      await this.tourRepo.save(tour);
    }

    const image = this.imageRepo.create({ tour, url, isMain });
    return await this.imageRepo.save(image);
  }

  async setMainImage(tourId: number, imageId: number) {
    const image = await this.imageRepo.findOne({
      where: { id: imageId, tour: { id: tourId } },
    });
    if (!image) throw new BadRequestException('Image not found for this tour');

    await this.imageRepo
      .createQueryBuilder()
      .update(TourImage)
      .set({ isMain: false })
      .where('tour_id = :tourId', { tourId })
      .execute();

    await this.imageRepo
      .createQueryBuilder()
      .update(TourImage)
      .set({ isMain: true })
      .where('id = :imageId AND tour_id = :tourId', { imageId, tourId })
      .execute();

    await this.tourRepo.update(tourId, { coverImage: image.url });

    return await this.tourRepo.findOne({ where: { id: tourId } });
  }
}
