import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@users/entities/user.entity';
import { Account } from '@auth/entities/account.entity';
import * as bcrypt from 'bcrypt';
import { Artist } from '@artists/entities/artist.entity';
import { ConfigService } from '@nestjs/config';
import { Role } from '@enums/role.enum';

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Artist.name) private artistModel: Model<Artist>,
  ) {}

  async seedDefaultAccountAndUser() {
    const isDefaultAccountExist = await this.accountModel.exists({
      email: this.configService.getOrThrow('DEFAULT_ACCOUNT_EMAIL'),
    });

    if (!isDefaultAccountExist) {
      const hashedPassword = await bcrypt.hash(
        this.configService.getOrThrow('DEFAULT_ACCOUNT_PASSWORD'),
        10,
      );
      const account = await this.accountModel.create({
        email: this.configService.getOrThrow('DEFAULT_ACCOUNT_EMAIL'),
        password: hashedPassword,
        firstName: 'Audionix',
        lastName: 'Admin',
        isVerified: true,
        role: [Role.ADMIN, Role.USER, Role.ARTIST],
      });

      await this.userModel.create({
        _id: account._id,
        avatar: [],
        email: this.configService.getOrThrow('DEFAULT_ACCOUNT_EMAIL'),
        followed_albums: [],
        followed_artists: [],
        username: this.configService.getOrThrow('DEFAULT_ACCOUNT_USERNAME'),
      });

      await this.artistModel.create({
        _id: account._id,
        name: this.configService.getOrThrow('DEFAULT_ACCOUNT_USERNAME'),
        cover_images: [],
        genres: [],
      });

      Logger.log(
        '✅ Default user, account, artist created with id: ' + account._id,
      );
    } else {
      Logger.log(
        'ℹ️ Accounts or users, artists already exist, skipping seeding',
      );
    }
  }
}
