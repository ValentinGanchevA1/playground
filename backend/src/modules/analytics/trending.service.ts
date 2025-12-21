// backend/src/modules/analytics/trending.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrendingService {
  constructor(private redis: RedisService) {}

  async trackTopic(topic: string, lat: number, lng: number) {
    const geoHash = this.getGeoHash(lat, lng, 5); // ~5km precision
    const hourKey = `trending:${geoHash}:${this.getCurrentHour()}`;

    await this.redis.zIncrBy(hourKey, 1, topic);
    await this.redis.expire(hourKey, 86400); // 24h TTL
  }

  async getTrendingTopics(lat: number, lng: number, limit = 10) {
    const geoHash = this.getGeoHash(lat, lng, 5);
    const hourKey = `trending:${geoHash}:${this.getCurrentHour()}`;

    const topics = await this.redis.zRevRange(hourKey, 0, limit - 1, 'WITHSCORES');

    return topics.map(([topic, score]) => ({
      topic,
      count: parseInt(score),
      velocity: this.calculateVelocity(topic, geoHash),
    }));
  }

  async getCommunityInsights(lat: number, lng: number, radiusKm: number) {
    const users = await this.locationsService.findNearbyUsers('', lat, lng, radiusKm, 1000);

    const insights = {
      totalUsers: users.length,
      activeNow: users.filter(u =>
        Date.now() - new Date(u.lastActiveAt).getTime() < 300000
      ).length,
      demographics: this.aggregateDemographics(users),
      topInterests: this.aggregateInterests(users),
      activityHeatmap: await this.getActivityHeatmap(lat, lng, radiusKm),
    };

    return insights;
  }
}
