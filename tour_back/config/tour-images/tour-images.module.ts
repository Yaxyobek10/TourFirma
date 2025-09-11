import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourImage } from "./tour-images.entity/tour.image.entity";
import { TourImagesController } from "./tour-images.controller";
import { TourImagesService } from "./tour-images.service";
import { Tour } from "../../tours/entities/tour.entity";





@Module({
    imports: [TypeOrmModule.forFeature([TourImage, Tour])],
    controllers: [TourImagesController],
    providers: [TourImagesService],
    exports: [TourImagesService]
})
export class TourImagesModule {}