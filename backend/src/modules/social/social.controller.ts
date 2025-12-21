// backend/src/modules/social/social.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SocialService } from './social.service';
import { SocialProvider } from '../users/entities/social-link.entity';

class LinkSocialDto {
  provider: SocialProvider;
  token: string;
}

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get('links')
  async getMyLinks(@CurrentUser() userId: string) {
    return this.socialService.getUserSocialLinks(userId);
  }

  @Post('link')
  async linkAccount(
    @CurrentUser() userId: string,
    @Body() dto: LinkSocialDto,
  ) {
    return this.socialService.linkSocialAccount(userId, dto.provider, dto.token);
  }

  @Delete('links/:id')
  async unlinkAccount(
    @CurrentUser() userId: string,
    @Param('id') linkId: string,
  ) {
    await this.socialService.unlinkSocialAccount(userId, linkId);
    return { success: true };
  }

  @Patch('links/:id/visibility')
  async toggleVisibility(
    @CurrentUser() userId: string,
    @Param('id') linkId: string,
  ) {
    return this.socialService.toggleVisibility(userId, linkId);
  }

  // Public endpoint for viewing others' social links
  @Get('users/:userId/links')
  async getUserLinks(@Param('userId') userId: string) {
    return this.socialService.getPublicSocialLinks(userId);
  }
}
