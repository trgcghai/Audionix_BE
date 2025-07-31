import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenPayload } from 'src/common/interfaces/token-payload.interface';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class RoleStrategy extends PassportStrategy(Strategy, 'role') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET_KEY'),
    });
  }

  async validate(payload: TokenPayload) {
    const { item } = await this.authService.findOne(payload.sub);
    return item;
  }
}
