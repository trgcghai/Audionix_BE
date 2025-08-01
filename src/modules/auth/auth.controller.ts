import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Account } from './entities/account.entity';
import { CurrentAccount } from 'src/common/decorators/current-account.decorator';
import { Response } from 'express';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { TokenPayload } from 'src/common/interfaces/token-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('accounts')
  getAllAccounts(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.authService.findAll(query, limit, current);
  }

  @Get('accounts/:id')
  getAccountById(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Delete('accounts')
  deleteManyAccounts(@Body('ids') ids: string[]) {
    return this.authService.remove(...ids);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentAccount() account: Account,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(account, response);
    return {
      message: 'Log in successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentAccount() account: Account,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(account._id.toString(), response);
    return {
      message: 'Logged out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentAccount() account: Account) {
    return account;
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  async verifyToken(
    @CurrentAccount() account: Account,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(account, response);
    return {
      message: 'Token refreshed successfully',
    };
  }
}
