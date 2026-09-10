import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { BeauticiansModule } from './beauticians/beauticians.module';
import { CustomersModule } from './customers/customers.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    ServicesModule,
    BookingsModule,
    BeauticiansModule,
    CustomersModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    TrackingModule,
  ],
})
export class AppModule {}
