import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenPayload } from '@common/interfaces/token-payload.interface';
import { AuthService } from '@modules/auth/auth.service';
import { RedisService } from '@modules/redis/redis.service';
import { RedisItemName, RedisServiceName } from '@modules/redis/redis-key.enum';
import * as crypto from 'crypto-js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.Refresh;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    try {
      const refreshToken = request.cookies?.Refresh;

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is missing');
      }

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const { item } = await this.authService.findOne(payload.sub);

      if (!item) {
        throw new NotFoundException('User not found');
      }

      const key = await this.redisService.createKey(
        RedisServiceName.AUTH,
        RedisItemName.REFRESH_TOKEN,
        payload.sub + ':' + crypto.SHA256(refreshToken).toString(),
      );

      const redisToken = await this.redisService.get(key);

      if (!redisToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (redisToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token does not match');
      }

      return item;
    } catch (error) {
      throw new BadRequestException(
        'Error validating refresh token: ' + error.message,
      );
    }
  }
}
