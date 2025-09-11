import { createHash } from 'crypto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') return undefined; 
    const cacheKey = createHash('md5').update(request.url).digest('hex');
    return `cache:${cacheKey}`;
  }
}


