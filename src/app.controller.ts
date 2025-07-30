import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './modules/redis/redis.service';
import { Public } from './common/decorators/is-public.decorator';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService, // Ensure MailerService is imported
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

  @Get('/mail')
  @Public()
  async testMail(): Promise<string> {
    try {
      await this.mailerService.sendMail({
        to: 'conghai.tpma@gmail.com',
        from: 'noreply@nestjs.com',
        subject: 'Testing Nest MailerModule ✔',
        text: 'welcome',
        template: 'register',
        context: {
          name: 'Cong Hai',
          activationCode: '123456',
        },
      });

      return 'Mail sent successfully';
    } catch (error) {
      console.error('Error sending mail:', error);
      return 'Failed to send mail';
    }
  }
}
