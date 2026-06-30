import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ToursModule } from './tours/tours.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GuidesModule } from './guides/guides.module';
import { GuideReviewsModule } from './guide-reviews/guide-review.module';
import { TourFirmaModule } from './tourfirma/tourfirma.module';
import * as redisStore from 'cache-manager-redis-store';
import { BookingModule } from './bookings/booking.module';
import { TourImagesModule } from './config/tour-images/tour-images.module';
import { PaymentModule } from './payments/payment.module';
import { TransportModule } from './transports/transport.module';
import { TransportBookingModule } from './transport-bookings/transport-booking.module';
import { GuideBookingModule } from './guide-booking/guide-booking.module';
import { TourReviewsModule } from './tour-reviews/tour-review.module';
import { TouristsService } from './tourist-profiles/tourist.service';
import { TouristsModule } from './tourist-profiles/tourist.module';
import { AgenciesModule } from './agencies/agencies.module';
import { CaselinkPackagesModule } from './caselink-packages/caselink-packages.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore as any,
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        ttl: 60,
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,   // 60 sekund
      limit: 20, // 20 ta request (per user/IP)
    }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'tour'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ToursModule,
    UsersModule,
    AuthModule,
    GuidesModule,
    GuideReviewsModule,
    TourFirmaModule,
    BookingModule,
    TourImagesModule,
    PaymentModule,
    TransportModule,
    TransportBookingModule,
    GuideBookingModule,
    TourReviewsModule,
    TouristsModule,
    AgenciesModule,
    CaselinkPackagesModule,
    LeadsModule
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

