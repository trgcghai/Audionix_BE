import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: configService.getOrThrow('AWS_S3_REGION'),
      forcePathStyle: false,
      useAccelerateEndpoint: false,
      credentials: {
        accessKeyId: configService.getOrThrow('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = configService.getOrThrow('AWS_S3_BUCKET_NAME');
  }

  async getImageDimensions(
    file: Express.Multer.File,
  ): Promise<{ width: number; height: number }> {
    const image = sharp(file.buffer); // use buffer from multer
    const metadata = await image.metadata();
    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  }

  async uploadImage({
    fileName,
    file,
    path = 'cover_images',
    author,
  }: {
    fileName: string;
    file: Express.Multer.File;
    path?: 'cover_images' | 'user_avatars';
    author: string;
  }) {
    try {
      const region = this.configService.getOrThrow('AWS_S3_REGION');

      const key = `${path}/${fileName}-${author}`;
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );

      return {
        url: `https://s3.${region}.amazonaws.com/${this.bucketName}/${key}`,
        key,
        size: file.size,
        mimetype: file.mimetype,
        ...(await this.getImageDimensions(file)),
      };
    } catch (error) {
      console.error('S3 upload error', error.stack || error.message, {
        fileName,
        path,
      });
      throw new BadGatewayException('File upload failed', {
        cause: error,
        description: 'Failed to upload file to S3 bucket',
      });
    }
  }

  async uploadTrack({
    fileName,
    file,
    author,
  }: {
    fileName: string;
    file: Express.Multer.File;
    author: string;
  }) {
    try {
      const region = this.configService.getOrThrow('AWS_S3_REGION');

      const key = `tracks/${fileName}-${author}`;
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );

      return {
        url: `https://s3.${region}.amazonaws.com/${this.bucketName}/${key}`,
        key,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      console.error('S3 upload error', error.stack || error.message, {
        fileName,
      });
      throw new BadGatewayException('File upload failed', {
        cause: error,
        description: 'Failed to upload file to S3 bucket',
      });
    }
  }

  async deleteFiles({ keys }: { keys: string[] }) {
    try {
      await Promise.all(
        keys.map((key) =>
          this.client.send(
            new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: key,
            }),
          ),
        ),
      );
    } catch (error) {
      console.error('S3 delete error', error.stack || error.message, {
        keys,
      });
      throw new BadGatewayException('File delete failed', {
        cause: error,
        description: 'Failed to delete file from S3 bucket',
      });
    }
  }
}
