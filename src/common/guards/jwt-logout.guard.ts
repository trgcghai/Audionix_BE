import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Injectable()
export class JwtLogoutGuard extends JwtAuthGuard {
  constructor(protected readonly reflector: Reflector) {
    super(reflector);
  }

  handleRequest(err, user): any {
    if (err || !user) {
      return null;
    }

    return user;
  }
}
