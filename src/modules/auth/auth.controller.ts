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
  Put,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { CurrentAccount } from '@common/decorators/current-account.decorator';
import { AuthService } from '@auth/auth.service';
import { RegisterDto, UpdateRolesDto } from '@auth/dto/auth.dto';
import { LocalAuthGuard } from '@guards/local-auth.guard';
import { Account } from '@auth/entities/account.entity';
import { JwtRefreshAuthGuard } from '@guards/jwt-refresh-auth.guard';
import { TokenPayload } from '@interfaces/token-payload.interface';
import { JwtLogoutGuard } from '@guards/jwt-logout.guard';
import { Public } from '@decorators/is-public.decorator';
import { Roles } from '@decorators/roles.decorator';
import { Role } from '@enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get all user accounts
   * @param query Query parameters for filtering
   * @param limit Number of accounts to return
   * @param current Current page number
   * @returns List of user accounts
   */
  @Get('accounts')
  getAllAccounts(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.authService.findAll(query, limit, current, '', '', [
      'email',
      'firstName',
      'lastName',
    ]);
  }

  /**
   * Get method for retrieving a user account by ID
   * @param id account ID
   * @returns User account details
   */
  @Get('accounts/:id')
  getAccountById(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  /**
   * Delete method for removing a user account by ID
   * @param id account ID
   * @returns Deletion result
   */
  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  /**
   * Delete method for removing multiple user accounts
   * @param ids array of account IDs
   * @returns Deletion result
   */
  @Delete('accounts')
  deleteManyAccounts(@Body('ids') ids: string[]) {
    return this.authService.remove(...ids);
  }

  /**
   * Register a new user account
   * @param registerDto Registration data
   * @returns Created user account
   */
  @Post('register')
  @Public()
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login a user account
   * @param account User account
   * @returns account detail, with JWT access and refresh tokens in cookies
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  async login(
    @CurrentAccount() account: Account,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.login(account, response);
  }

  /**
   * Logout a user account
   * @param account User account
   * @returns Logout result
   */
  @Post('logout')
  @UseGuards(JwtLogoutGuard)
  @Public()
  async logout(
    @CurrentAccount() account: TokenPayload,
    @Request() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (account) {
      await this.authService.logout(account.sub, request, response);
      return {
        message: 'Log out successfully',
      };
    }
    return {
      message: 'No account found to log out or token is invalid',
    };
  }

  /**
   * Get the profile of the current user
   * @param account User account
   * @returns User account details
   */
  @Get('profile')
  getProfile(@CurrentAccount() account: TokenPayload) {
    return account;
  }

  /**
   * Refresh JWT access token
   * @param account User account
   * @returns New JWT access token
   */
  @UseGuards(JwtRefreshAuthGuard)
  @Public()
  @Post('refresh-token')
  async verifyToken(
    @CurrentAccount() account: Account,
    @Request() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.refreshToken(account, request, response);
    return {
      message: 'Token refreshed successfully',
    };
  }

  /**
   * Verify OTP for email
   * @param email User email
   * @param code OTP code
   * @returns Verification result
   */
  @Public()
  @Post('verify-otp')
  verifyOtp(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verifyOtp(email, code);
  }

  /**
   * Resend OTP for email
   * @param email User email
   * @returns Resend result
   */
  @Public()
  @Post('send-otp')
  resendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  /**
   * Update user password
   * @param newPassword User's new password
   * @param oldPassword User's old password
   * @param payload User's token payload
   * @returns Updated user account
   */
  @Put('accounts/password')
  updatePassword(
    @Body('newPassword') newPassword: string,
    @Body('oldPassword') oldPassword: string,
    @CurrentAccount() payload: TokenPayload,
  ) {
    return this.authService.updatePassword({
      email: payload.email,
      oldPassword,
      newPassword,
    });
  }

  /**
   * Activate user accounts
   * @param accountIds Array of account IDs to activate
   * @returns Activation result
   */
  @Roles(Role.ADMIN)
  @Put('accounts/activation')
  activateAccounts(@Body('accountIds') accountIds: string[]) {
    return this.authService.activateAccounts(accountIds);
  }

  /**
   * Deactivate user accounts
   * @param accountIds Array of account IDs to deactivate
   * @returns Deactivation result
   */
  @Roles(Role.ADMIN)
  @Put('accounts/deactivation')
  deactivateAccounts(@Body('accountIds') accountIds: string[]) {
    return this.authService.deactivateAccounts(accountIds);
  }

  /**
   * Update roles for multiple accounts
   * @param updateRolesDto Contains account IDs and new roles
   * @returns Update operation result
   */
  @Roles(Role.ADMIN)
  @Put('accounts/roles')
  updateAccountRoles(@Body() updateRolesDto: UpdateRolesDto) {
    return this.authService.updateAccountRoles(updateRolesDto);
  }
}
