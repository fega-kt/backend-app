// presign.interceptor.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { NestInterceptor } from '@nestjs/common';
import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AwsS3Service } from '../shared/services/aws-s3.service';
import { PRESIGN_METADATA_KEY } from './presign.decorator';

// ✅ Danh sách key được phép presign
const PRESIGN_FIELDS = new Set(['avatar', 'file', 'image', 'document', 'url']);

@Injectable()
export class PresignInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly awsS3Service: AwsS3Service,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  intercept<T>(context: ExecutionContext, next: CallHandler): Observable<T> {
    const shouldPresign = this.reflector.get<boolean>(
      PRESIGN_METADATA_KEY,
      context.getHandler(),
    );

    if (!shouldPresign) {
      return next.handle() as Observable<T>;
    }

    return next.handle().pipe(mergeMap((data: T) => from(this.process(data))));
  }

  private async process<T>(data: T): Promise<T> {
    if (!data) {
      return data;
    }

    // ✅ Nếu là string → chỉ presign khi là key S3 hợp lệ

    // if (typeof data === 'string') {
    //   return (await this.tryPresign(data)) as T;
    // }

    // ✅ Array → xử lý từng item
    if (Array.isArray(data)) {
      const result = await Promise.all(data.map((item) => this.process(item)));

      return result as T;
    }

    // ✅ Object → chỉ presign field nằm trong PRESIGN_FIELDS
    if (typeof data === 'object') {
      if (data instanceof Date) {
        return data;
      }

      const obj = data as Record<string, unknown>;

      const entries = await Promise.all(
        Object.entries(obj).map(async ([key, value]) => {
          if (PRESIGN_FIELDS.has(key) && typeof value === 'string') {
            // 🎯 Chỉ presign field nằm trong whitelist
            const processed = await this.tryPresign(value);

            return [key, processed];
          }

          // các field khác → xử lý đệ quy bình thường (nhưng không presign string)
          const processed = await this.process(value);

          return [key, processed];
        }),
      );

      return Object.fromEntries(entries) as T;
    }

    return data;
  }

  private async tryPresign(value: string): Promise<string> {
    if (typeof value !== 'string' || !value.includes('/')) {
      return value;
    }

    const cached = await this.cacheManager.get<string>(value);

    if (cached) {
      return cached;
    }

    try {
      const url = await this.awsS3Service.getPresignedUrl(value);

      await this.cacheManager.set(value, url, 3600);

      return url;
    } catch (error) {
      console.error(error);

      return value;
    }
  }
}
