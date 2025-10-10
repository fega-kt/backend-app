import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import mime from 'mime-types';

import type { IFile } from './../../interfaces/IFile.ts';
import { ApiConfigService } from './api-config.service.ts';
import { GeneratorService } from './generator.service.ts';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3Client;

  private logger = new Logger('AwsS3Service');

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const config = configService.awsS3Config;

    this.s3 = new S3Client({
      apiVersion: config.bucketApiVersion,
      region: config.bucketRegion,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async onModuleInit() {
    this.logger.log('--------------- AWS S3 Config ----------------');

    try {
      await this.s3.send(
        new HeadBucketCommand({
          Bucket: this.configService.awsS3Config.bucketName,
        }),
      );

      this.logger.log('✅ S3 bucket is accessible!');
    } catch (error) {
      this.logger.error('❌ Cannot access bucket:', error);
    }

    this.logger.log('--------------- AWS S3 Config ----------------');
  }

  async uploadImage(file: IFile): Promise<string> {
    const fileName = this.generatorService.fileName(
      mime.extension(file.mimetype) as string,
    );
    const key = `images/${fileName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.configService.awsS3Config.bucketName,
        Body: file.buffer,
        Key: key,
        // ACL: 'public-read', // nếu muốn public
        ContentType: file.mimetype, // nên thêm để S3 biết kiểu file
      }),
    );

    return key;
  }

  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.awsS3Config.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return url;
  }
}
