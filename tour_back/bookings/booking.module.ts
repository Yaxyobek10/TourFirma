import { Module } from "@nestjs/common";
import { Booking } from "./entities/booking.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { Tour } from "../tours/entities/tour.entity";
import { ScheduleModule } from '@nestjs/schedule';
import { BookingHistory } from "./entities/booking-history.entity";
import { BookingHistoryController } from "../admin/BookingHistory.controller";


@Module({
    imports: [TypeOrmModule.forFeature([Booking, Tour, BookingHistory]),
        ScheduleModule.forRoot()],
    controllers: [BookingController, BookingHistoryController],
    providers: [BookingService, ],
    exports: [BookingService]
})
export class BookingModule {}