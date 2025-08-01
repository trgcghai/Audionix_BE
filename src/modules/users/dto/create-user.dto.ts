import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

class AvatarDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @Min(1, {
    message: 'Height must be a positive number',
  })
  height: number;

  @IsNumber()
  @Min(1, {
    message: 'Width must be a positive number',
  })
  width: number;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvatarDto)
  @IsOptional()
  avatar: AvatarDto[];
}
