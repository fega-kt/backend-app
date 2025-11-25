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

    // ✅ Array → xử lý từng item song song
    if (Array.isArray(data)) {
      return Promise.all(data.map((item) => this.process(item))) as Promise<T>;
    }

    // ✅ Object → xử lý song song tất cả field
    if (typeof data === 'object') {
      if (data instanceof Date) {
        return data;
      }

      const obj = data as Record<string, unknown>;

      const entries = Object.entries(obj).map(async ([key, value]) => {
        if (PRESIGN_FIELDS.has(key) && typeof value === 'string') {
          // presign field nằm trong whitelist
          return [key, await this.tryPresign(value)];
        }

        // đệ quy các field khác
        return [key, await this.process(value)];
      });

      const resolvedEntries = await Promise.all(entries);

      return Object.fromEntries(resolvedEntries) as T;
    }

    // các kiểu khác giữ nguyên
    return data;
  }

  private async tryPresign(value: string): Promise<string> {
    if (typeof value !== 'string' || !value.includes('/')) {
      return value;
    }

    // check cache trước
    const cached = await this.cacheManager.get<string>(value);

    if (cached) {
      return cached;
    }

    try {
      const url = await this.awsS3Service.getPresignedUrl(value);
      // lưu cache 1 giờ
      await this.cacheManager.set(value, url, 3600);

      return url;
    } catch (error) {
      console.error('Presign error:', error);

      return value; // fallback
    }
  }
}
