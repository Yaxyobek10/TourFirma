import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment-entity";
import { Booking } from "../bookings/entities/booking.entity";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { BookingHistory } from "../bookings/entities/booking-history.entity";
import { ClickService } from "../common/gateways/click.service";
import { PaymeService } from "../common/gateways/payme.service";
import { ConfigModule } from "@nestjs/config";




@Module({
    imports: [TypeOrmModule.forFeature([Payment, Booking, BookingHistory]),
    ConfigModule.forRoot()
    ],
    controllers: [PaymentController],
    providers: [PaymentService, ClickService, PaymeService],
    exports: [PaymentService, ClickService, PaymeService],
})
export class PaymentModule {}