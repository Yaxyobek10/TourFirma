import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GuideBooking } from "./entity/guide-booking.entity";
import { GuideBookingsController } from "./guide-booking.controller";
import { GuideBookingsService } from "./guide-booking.service";
import { Guide } from "../guides/entities/guide.entity";
import { GuideReview } from "../guide-reviews/entities/review.entity";




@Module({
    imports: [TypeOrmModule.forFeature([GuideBooking, Guide, GuideReview ])],
    controllers: [GuideBookingsController],
    providers: [GuideBookingsService],
    exports: [GuideBookingsService],
})


export class GuideBookingModule {}