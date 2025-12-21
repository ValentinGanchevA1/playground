import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RedisService } from '../../common/redis.service';

const GEO_KEY = 'user:locations';

export interface NearbyUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  verificationScore: number;
  isOnline: boolean;
}

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private redisService: RedisService,
  ) {}

  // ─── Update User Location ─────────────────────────────────────────────

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<{ success: boolean }> {
    // Update in PostgreSQL with PostGIS
    await this.usersRepository.update(userId, {
      location: () => `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastLocationUpdate: new Date(),
      lastSeenAt: new Date(),
    });

    // Update in Redis for fast geo queries
    await this.redisService.geoAdd(GEO_KEY, longitude, latitude, userId);

    return { success: true };
  }

  // ─── Find Nearby Users (Hybrid Redis + PostgreSQL) ────────────────────

  async findNearbyUsers(
    currentUserId: string,
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 50,
  ): Promise<NearbyUser[]> {
    // Fast lookup from Redis
    const nearbyFromRedis = await this.redisService.geoRadius(
      GEO_KEY,
      longitude,
      latitude,
      radiusKm,
      'km',
      { withDist: true, count: limit + 1 }, // +1 to exclude self
    );

    if (nearbyFromRedis.length === 0) {
      return [];
    }

    // Extract user IDs (exclude self)
    const userIds: string[] = [];
    const distanceMap = new Map<string, number>();

    for (let i = 0; i < nearbyFromRedis.length; i += 2) {
      const userId = nearbyFromRedis[i];
      const distance = parseFloat(nearbyFromRedis[i + 1]);
      
      if (userId !== currentUserId) {
        userIds.push(userId);
        distanceMap.set(userId, distance);
      }
    }

    if (userIds.length === 0) {
      return [];
    }

    // Fetch full user data from PostgreSQL
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.displayName',
        'user.avatarUrl',
        'user.lastLatitude',
        'user.lastLongitude',
        'user.verificationScore',
        'user.lastSeenAt',
        'user.profile',
      ])
      .where('user.id IN (:...userIds)', { userIds })
      .andWhere('user.isVisible = :visible', { visible: true })
      .andWhere('user.isActive = :active', { active: true })
      .andWhere('user.isBanned = :banned', { banned: false })
      .take(limit)
      .getMany();

    // Map to response format with distance
    return users.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      latitude: user.lastLatitude,
      longitude: user.lastLongitude,
      distanceKm: distanceMap.get(user.id) || 0,
      verificationScore: user.verificationScore,
      isOnline: this.isUserOnline(user.lastSeenAt),
    }));
  }

  // ─── Get Users in Bounding Box (Map Viewport) ─────────────────────────

  async getUsersInBoundingBox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
    limit: number = 100,
  ): Promise<NearbyUser[]> {
    // Use PostGIS ST_Within for bounding box query
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.displayName',
        'user.avatarUrl',
        'user.lastLatitude',
        'user.lastLongitude',
        'user.verificationScore',
        'user.lastSeenAt',
      ])
      .where(
        `ST_Within(
          user.location::geometry,
          ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
        )`,
        { minLng, minLat, maxLng, maxLat },
      )
      .andWhere('user.isVisible = :visible', { visible: true })
      .andWhere('user.isActive = :active', { active: true })
      .andWhere('user.isBanned = :banned', { banned: false })
      .take(limit)
      .getMany();

    return users.map((user) => ({
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      latitude: user.lastLatitude,
      longitude: user.lastLongitude,
      distanceKm: 0, // Not calculated for bounding box
      verificationScore: user.verificationScore,
      isOnline: this.isUserOnline(user.lastSeenAt),
    }));
  }

  // ─── Find Users Within Radius (Pure PostGIS) ──────────────────────────

  async findUsersWithinRadiusPostGIS(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    limit: number = 50,
  ): Promise<any[]> {
    // Using the custom PostgreSQL function we created in migration
    return this.usersRepository.query(
      `SELECT * FROM find_users_within_radius($1, $2, $3, $4)`,
      [latitude, longitude, radiusMeters, limit],
    );
  }

  // ─── Remove User from Geo Index ───────────────────────────────────────

  async removeFromGeoIndex(userId: string): Promise<void> {
    await this.redisService.geoRemove(GEO_KEY, userId);
  }

  // ─── Helper: Check if user is online (active in last 5 minutes) ───────

  private isUserOnline(lastSeenAt: Date | null): boolean {
    if (!lastSeenAt) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
  }
}
