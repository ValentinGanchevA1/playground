import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { Verification } from './entities/verification.entity';
import { User } from '../users/entities/user.entity';
import { TwilioService } from '../../common/twilio.service';
import { S3Service } from '../../common/s3.service';
import { FaceCompareService } from '../../common/face-compare.service';
import { EmailService } from '../../common/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Verification, User])],
  controllers: [VerificationController],
  providers: [
    VerificationService,
    TwilioService,
    S3Service,
    FaceCompareService,
    EmailService,
  ],
  exports: [VerificationService],
})
export class VerificationModule {}
