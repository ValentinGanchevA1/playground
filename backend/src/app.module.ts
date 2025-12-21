import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { VerificationModule } from './modules/verification/verification.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { EventsModule } from './modules/events/events.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { GiftsModule } from './modules/gifts/gifts.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    LocationsModule,
    ChatModule,
    PaymentsModule,
    VerificationModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
    DiscoveryModule,
    EventsModule,
    GamificationModule,
    GiftsModule,
    InteractionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
