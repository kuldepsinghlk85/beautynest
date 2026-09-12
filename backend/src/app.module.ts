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
import { PackagesModule } from './packages/packages.module';
import { SlidersModule } from './sliders/sliders.module';
import { OffersModule } from './offers/offers.module';
import { CouponsModule } from './coupons/coupons.module';
import { BeauticianWebModule } from './beautician-web/beautician-web.module';
import { NavigationModule } from './navigation/navigation.module';

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
    PackagesModule,
    SlidersModule,
    OffersModule,
    CouponsModule,
    BeauticianWebModule,
    NavigationModule,
  ],
})
export class AppModule {}

