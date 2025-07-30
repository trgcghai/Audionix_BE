import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenPayload } from 'src/common/interfaces/token-payload.interface';
import { AuthService } from '../auth.service';
import { RedisService } from 'src/modules/redis/redis.service';

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

      const redisToken = await this.redisService.get(
        'refreshToken:' + item._id,
      );

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
