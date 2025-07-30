import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from '@redis/client';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisService, // Cung cấp RedisService để các module khác có thể inject và sử dụng
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClientType> => {
        const host = configService.getOrThrow<string>(
          'REDIS_HOST',
          'localhost',
        );
        const port = configService.getOrThrow<number>('REDIS_PORT', 6379);
        const username = configService.getOrThrow<string>(
          'REDIS_USERNAME',
          'default',
        );
        const password = configService.getOrThrow<string>('REDIS_PASSWORD');

        const client = createClient({
          url: `redis://${host}:${port}`,
          username,
          password,
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService], // Export RedisService để các module khác sử dụng
})
export class RedisModule {}
