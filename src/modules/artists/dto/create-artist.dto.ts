import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

class CoverImageDto {
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

export class CreateArtistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoverImageDto)
  @IsOptional()
  cover_images: CoverImageDto[];
}
