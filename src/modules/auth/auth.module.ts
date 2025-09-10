import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@users/users.module';
import { RedisModule } from '@redis/redis.module';
import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { OtpService } from '@auth/otp.service';
import { LocalStrategy } from '@guards/strategies/local.strategy';
import { JwtStrategy } from '@guards/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@guards/strategies/jwt-refresh.strategy';
import { Account, AccountSchema } from '@auth/entities/account.entity';

@Module({
  imports: [
    PassportModule,
    RedisModule,
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      {
        name: Account.name,
        schema: AccountSchema,
      },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET_KEY'),
          signOptions: {
            expiresIn: configService.getOrThrow<string>(
              'JWT_ACCESS_TOKEN_EXPIRED',
            ),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
