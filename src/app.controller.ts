import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './modules/redis/redis.service';
import { Public } from './common/decorators/is-public.decorator';
import { MailerService } from '@nestjs-modules/mailer';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from './common/enums/role.enum';
import { JwtRoleGuard } from './common/guards/jwt-role.guard';

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

  @Roles(Role.ADMIN)
  @UseGuards(JwtRoleGuard)
  @Get('admin')
  async getAdmin() {
    return 'You are an admin';
  }

  @Roles(Role.USER)
  @UseGuards(JwtRoleGuard)
  @Get('user')
  async getUser() {
    return 'You are a user';
  }

  @Roles(Role.ARTIST, Role.USER)
  @UseGuards(JwtRoleGuard)
  @Get('artist')
  async getArtist() {
    return 'You are an artist';
  }
}
