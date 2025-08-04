import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor() {
    super();
  }

  handleRequest(err, user): any {
    if (err || !user) {
      throw err || new BadRequestException('Invalid credentials');
    }
    return user;
  }
}
