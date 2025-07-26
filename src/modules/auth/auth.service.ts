import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { Account } from './entities/account.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @Inject() private userService: UsersService,
  ) {}

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
    const { email, password, username } = registerDto;

    const isEmailExists = await this.accountModel.exists({ email });

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const createAccountResult = await this.accountModel.create({
      email,
      password,
      username,
    });

    const createUserResult = await this.userService.create({
      email,
      username,
      avatar: [],
    });

    return {
      result: {
        account: createAccountResult._id,
        user: createUserResult._id,
      },
    };
  }

  login(loginDto: LoginDto) {
    return {
      message: 'User logged in successfully',
      user: loginDto,
    };
  }
}
