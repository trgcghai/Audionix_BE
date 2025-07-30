import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  // Lưu dữ liệu vào Redis
  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl); // Thiết lập thời gian sống (giây)
    }
  }

  // Lấy dữ liệu từ Redis
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  // Xóa dữ liệu từ Redis
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  // Lưu object dưới dạng JSON
  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value));
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  // Lấy object từ JSON
  async getJson(key: string): Promise<any | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }
}
