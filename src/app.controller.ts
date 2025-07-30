import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './modules/redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('set')
  async setData(@Body() body: { key: string; value: any; ttl?: number }) {
    await this.redisService.setJson(body.key, body.value, body.ttl);
    return { message: `Data stored with key ${body.key}` };
  }

  @Get('get/:key')
  async getData(@Param('key') key: string) {
    const data = await this.redisService.getJson(key);
    return { key, data };
  }
}
