// backend/src/modules/verification/verification.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerificationService } from './verification.service';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Get('status')
  async getStatus(@CurrentUser() userId: string) {
    return this.verificationService.getVerificationStatus(userId);
  }


  // Email verification
  @Post('email/send')
  async sendEmailCode(
    @CurrentUser() userId: string,
    @Body('email') email: string,
  ) {
    return this.verificationService.sendEmailCode(userId, email);
  }

  @Post('email/verify')
  async verifyEmail(
    @CurrentUser() userId: string,
    @Body('code') code: string,
  ) {
    return this.verificationService.verifyEmailCode(userId, code);
  }

  @Post('email/resend')
  async resendEmail(@CurrentUser() userId: string) {
    return this.verificationService.resendEmailCode(userId);
  }

  // Phone verification
  @Post('phone/send')
  async sendPhoneCode(
    @CurrentUser() userId: string,
    @Body('phone') phone: string,
  ) {
    return this.verificationService.sendPhoneCode(userId, phone);
  }

  @Post('phone/verify')
  async verifyPhone(
    @CurrentUser() userId: string,
    @Body('code') code: string,
  ) {
    return this.verificationService.verifyPhoneCode(userId, code);
  }

  // Photo verification
  @Post('photo/initiate')
  async initiatePhoto(@CurrentUser() userId: string) {
    return this.verificationService.initiatePhotoVerification(userId);
  }

  @Post('photo/submit')
  @UseInterceptors(FileInterceptor('selfie'))
  async submitPhoto(
    @CurrentUser() userId: string,
    @UploadedFile() selfie: Express.Multer.File,
  ) {
    return this.verificationService.submitPhotoVerification(userId, selfie);
  }

  // ID verification
  @Post('id/submit')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'front', maxCount: 1 },
      { name: 'back', maxCount: 1 },
    ]),
  )
  async submitId(
    @CurrentUser() userId: string,
    @UploadedFiles() files: { front: Express.Multer.File[]; back?: Express.Multer.File[] },
  ) {
    return this.verificationService.submitIdVerification(
      userId,
      files.front[0],
      files.back?.[0],
    );
  }
}
