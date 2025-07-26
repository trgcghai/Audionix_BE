import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // get all accounts - retrieve all accounts
  @Get('accounts')
  getAllAccounts(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.authService.findAll(query, limit, current);
  }

  // get account by id - retrieve a specific account by ID
  @Get('accounts/:id')
  getAccountById(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  // delete an account - remove an account by ID
  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  // delete many accounts - remove multiple accounts based on ids
  @Delete('accounts')
  deleteManyAccounts(@Body('ids') ids: string[]) {
    return this.authService.remove(...ids);
  }

  // register - create a new account and new user
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // login - authenticate user and return access token and refresh token
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // refresh - refresh access token using refresh token
  @Post('refresh')
  refresh() {
    return 'this endpoint will refresh the access token using the provided refresh token';
  }

  // authenticate - check if the user is authenticated
  @Get('authenticate')
  authenticate() {
    return 'this endpoint will check if the user is authenticated';
  }

  // logout - invalidate the access token and refresh token
  @Post('logout')
  logout() {
    return 'this endpoint will invalidate the access token and refresh token';
  }

  // forgotPassword - send reset password email
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return `Reset password email sent to ${email}`;
  }

  // verify otp - verify the OTP sent to the user
  @Post('verify-otp')
  verifyOtp(@Body('otp') otp: string) {
    return `OTP ${otp} verified successfully`;
  }
}
