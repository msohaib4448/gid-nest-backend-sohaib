import { Injectable, NestMiddleware, Inject } from '@nestjs/common';

import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { Request, NextFunction } from 'express';

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
  ) {}

  async use(req: Request, res: any, next: NextFunction) {
    const key = req.originalUrl;
    console.log('redisKey:', key);
    try {
      const cachedResponse: string = await this.cacheManager.get(key);
      if (cachedResponse) {
        // Return cached response directly if available

        console.log(
          cachedResponse,
          '-------------------------------Redis cached users',
        );

        return res.send(JSON.parse(cachedResponse));
      } else {
        // Override send method to cache response before sending it

        const originalSend = res.send.bind(res);
        res.send = async (body: any) => {
          try {
            if (!checkRedisReturnData(body)) {
              await this.cacheManager.set(key, body, 60 * 1000);

              console.log(
                body,
                '-------------------------------Redis cache updated with users',
              );
            }
          } catch (err) {
            console.error(`Error caching response for key: ${key}`, err);
          }
          originalSend(body);
        };
      }

      next(); // Move to the next middleware
    } catch (err) {
      console.error(`Error in cacheMiddleware for key: ${key}`, err);
      next(err); // Pass any errors to the error handling middleware
    }
  }
}

export function checkRedisReturnData(data: any) {
  if (typeof data !== 'undefined' && data !== null) {
    if (Array.isArray(data)) {
      return data.length > 0;
    } else if (typeof data === 'object') {
      return Object.keys(data).length > 0;
    }
  }
  return false;
}
