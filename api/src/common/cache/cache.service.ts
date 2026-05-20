import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cache.get<T>(key) ?? undefined;
    } catch (error) {
      this.logger.warn(
        `Cache get failed [${key}]: ${error instanceof Error ? error.message : error}`,
      );
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(
        `Cache set failed [${key}]: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (error) {
      this.logger.warn(
        `Cache del failed [${key}]: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    console.log('cached', cached);
    if (cached !== undefined) return cached;

    const result = await fn();
    console.log('new result');
    await this.set(key, result, ttl);
    return result;
  }

  async getVersion(versionKey: string): Promise<number> {
    return (await this.get<number>(versionKey)) ?? 0;
  }

  async bumpVersion(versionKey: string, ttl = 86_400_000): Promise<void> {
    const next = (await this.getVersion(versionKey)) + 1;
    await this.set(versionKey, next, ttl);
  }
}