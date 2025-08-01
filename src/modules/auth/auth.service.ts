import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { Account } from './entities/account.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/common/interfaces/token-payload.interface';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @Inject() private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw new BadRequestException('Error hashing password');
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new UnauthorizedException('Invalid password');
    }
  }

  async generateTokens(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET_KEY'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_ACCESS_TOKEN_EXPIRED',
      ),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET_KEY'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_EXPIRED',
      ),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async findAll(
    query: Record<string, any>,
    limit: number = 10,
    current: number = 1,
  ) {
    const { filter, sort } = aqp(query);

    if (filter.limit) delete filter.limit;
    if (filter.current) delete filter.current;

    const totalItems = await this.accountModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (current - 1) * limit;

    const result = await this.accountModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort as Record<string, 1 | -1>)
      .exec();

    return {
      items: result,
      totalItems,
      totalPages,
      current: parseInt(current.toString()),
      limit: parseInt(limit.toString()),
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const item = await this.accountModel.findOne({ _id: id }).exec();

    if (!item) {
      throw new NotFoundException(`Account not found`);
    }

    return {
      item,
    };
  }

  async findMany(ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
    }

    const items = await this.accountModel.find({ _id: { $in: ids } }).exec();

    if (items.length === 0) {
      throw new NotFoundException(`Account not found`);
    }

    return {
      items,
    };
  }

  async remove(...ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
    }

    const result = await this.accountModel
      .deleteMany({ _id: { $in: ids } })
      .exec();

    return {
      deletedCount: result.deletedCount,
      message:
        result.deletedCount > 0
          ? `Account deleted successfully`
          : `Account not found`,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const isEmailExists = await this.accountModel.exists({ email });

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const createAccountResult = await this.accountModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    const createUserResult = await this.userService.create({
      email,
      username: firstName + ' ' + lastName,
      avatar: [],
    });

    return {
      result: {
        account: createAccountResult._id,
        user: createUserResult._id,
      },
    };
  }

  async login(account: Account, response: Response) {
    const { accessToken, refreshToken } = await this.generateTokens({
      sub: account._id.toString(),
      email: account.email,
      role: account.role,
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await this.redisService.del('refreshToken:' + account._id);

    await this.redisService.set(
      'refreshToken:' + account._id,
      refreshToken,
      7 * 24 * 60 * 60,
    );
  }

  async validateAccount(email: string, pass: string): Promise<any> {
    const account = await this.accountModel
      .findOne({ email })
      .select('+password')
      .exec();

    if (!account) return null;

    const isPasswordValid = await this.comparePassword(pass, account.password);

    if (!isPasswordValid) return null;

    const { password, ...result } = account.toJSON();

    return result;
  }

  async logout(accountId: string, response: Response) {
    if (!mongoose.isValidObjectId(accountId)) {
      throw new BadRequestException('Invalid account ID format');
    }

    const account = await this.accountModel.findById(accountId).exec();

    if (!account) {
      throw new NotFoundException(`Account not found`);
    }

    await this.redisService.del('refreshToken:' + account._id);

    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
  }
}
