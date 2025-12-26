import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { TradingModule } from './modules/trading/trading.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - multiple tiers for different use cases
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second window
        limit: 5,    // 5 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 second window
        limit: 30,   // 30 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minute window
        limit: 100,  // 100 requests per minute
      },
    ]),

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
    TradingModule,
  ],
  controllers: [HealthController],
  providers: [
    // Enable rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
