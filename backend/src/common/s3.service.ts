import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: any;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'g88-uploads';

    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (region && accessKeyId && secretAccessKey) {
      import('@aws-sdk/client-s3').then(({ S3Client }) => {
        this.s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      }).catch(() => {
        console.warn('AWS SDK not installed, S3 functionality disabled');
      });
    }
  }

  async upload(buffer: Buffer, key: string, contentType = 'image/jpeg'): Promise<string> {
    if (!this.s3Client) {
      console.warn('S3 not configured, returning mock URL');
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    if (!this.s3Client) {
      return;
    }

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.s3Client) {
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }

    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
