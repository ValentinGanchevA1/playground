import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { RedisService } from '../../common/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LocationsController],
  providers: [LocationsService, RedisService],
  exports: [LocationsService],
})
export class LocationsModule {}
