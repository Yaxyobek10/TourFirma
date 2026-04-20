import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransportBooking } from "./entities/transport-booking.entity";
import { Transport } from "../transports/entities/transport.entity";
import { TransportBookingController } from "./transport-booking.controller";
import { TransportBookingService } from "./transport-booking.service";
import { User } from "../users/entities/user.entity";
import { TourFirmaProfile } from "../tourfirma/entities/tourfirma.entity";
import { TransportBookingItem } from "./entities/transport-booking-item.entity";




@Module({
    imports: [TypeOrmModule.forFeature([TransportBooking, Transport, User, TourFirmaProfile, TransportBookingItem])],
    controllers: [TransportBookingController],
    providers: [TransportBookingService],
    exports: [TransportBookingService]
})

export class TransportBookingModule {}