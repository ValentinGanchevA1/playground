import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LocationsService, NearbyUser } from './locations.service';
import { User } from '../users/entities/user.entity';

class UpdateLocationDto {
  latitude: number;
  longitude: number;
}

class NearbyQueryDto {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
}

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('update')
  @ApiOperation({ summary: 'Update user location' })
  async updateLocation(
    @CurrentUser() user: User,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.updateLocation(
      user.id,
      dto.latitude,
      dto.longitude,
    );
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby users' })
  async getNearbyUsers(
    @CurrentUser() user: User,
    @Query() query: NearbyQueryDto,
  ): Promise<NearbyUser[]> {
    return this.locationsService.findNearbyUsers(
      user.id,
      query.latitude,
      query.longitude,
      query.radiusKm || 5,
      query.limit || 50,
    );
  }

  @Get('bounding-box')
  @ApiOperation({ summary: 'Get users in bounding box (map viewport)' })
  async getUsersInBoundingBox(
    @Query('minLat') minLat: number,
    @Query('minLng') minLng: number,
    @Query('maxLat') maxLat: number,
    @Query('maxLng') maxLng: number,
    @Query('limit') limit?: number,
  ): Promise<NearbyUser[]> {
    return this.locationsService.getUsersInBoundingBox(
      minLat,
      minLng,
      maxLat,
      maxLng,
      limit || 100,
    );
  }
}
