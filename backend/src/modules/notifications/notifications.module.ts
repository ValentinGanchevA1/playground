import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Geofence } from './entities/geofence.entity';
import { GeofenceService } from './geofence.service';
import { RedisService } from '../../common/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Geofence])],
  providers: [GeofenceService, RedisService],
  exports: [GeofenceService],
})
export class NotificationsModule {}
