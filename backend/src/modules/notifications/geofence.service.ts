// backend/src/modules/notifications/geofence.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Entity('geofences')
export class Geofence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'geography', spatialFeatureType: 'Polygon', srid: 4326 })
  boundary: GeoJSON.Polygon;

  @Column({ type: 'jsonb' })
  triggerConfig: {
    onEnter: boolean;
    onExit: boolean;
    notificationTemplate: string;
  };

  @Column({ default: true })
  isActive: boolean;
}

@Injectable()
export class GeofenceService {
  async checkGeofences(userId: string, lat: number, lng: number) {
    const triggeredFences = await this.geofenceRepo
      .createQueryBuilder('fence')
      .where(
        `ST_Contains(fence.boundary, ST_SetSRID(ST_Point(:lng, :lat), 4326))`,
        { lat, lng },
      )
      .andWhere('fence.isActive = true')
      .getMany();

    // Get user's previous geofence states from Redis
    const prevStates = await this.redis.hGetAll(`user:${userId}:geofences`);

    for (const fence of triggeredFences) {
      const wasInside = prevStates[fence.id] === 'inside';
      const isInside = true;

      if (!wasInside && isInside && fence.triggerConfig.onEnter) {
        await this.sendNotification(userId, fence, 'enter');
      }

      await this.redis.hSet(`user:${userId}:geofences`, fence.id, 'inside');
    }

    // Check for exits
    for (const [fenceId, state] of Object.entries(prevStates)) {
      if (state === 'inside' && !triggeredFences.find(f => f.id === fenceId)) {
        const fence = await this.geofenceRepo.findOne({ where: { id: fenceId } });
        if (fence?.triggerConfig.onExit) {
          await this.sendNotification(userId, fence, 'exit');
        }
        await this.redis.hDel(`user:${userId}:geofences`, fenceId);
      }
    }
  }
}
