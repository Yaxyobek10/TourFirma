import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transport } from "./entities/transport-entity";
import { TransportController } from "./transport.controller";
import { TransportService } from "./transport.service";
import { TransportBooking } from "../transport-bookings/entities/transport-booking-entity";
import { TourFirmaProfile } from "../tourfirma/entities/tourfirma-entity";
import { TransportBookingItem } from "../transport-bookings/entities/transport-booking.Item.entity";




@Module({
    imports: [TypeOrmModule.forFeature([Transport, TransportBooking, TourFirmaProfile, TransportBookingItem])],
    controllers: [TransportController],
    providers: [TransportService],
    exports: [TransportService]
})

export class TransportModule {}