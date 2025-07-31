import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../../../modules/auth/auth.service';
import { Account } from '../../../modules/auth/entities/account.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Account> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const account = await this.authService.validateAccount(email, password);

    if (!account) {
      throw new NotFoundException('Invalid email or password');
    }

    return account;
  }
}
