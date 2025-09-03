import {
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
} from '@common/constants/file.constant';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadTrackFilesValidator implements PipeTransform {
  transform(files: {
    audio?: Express.Multer.File[];
    cover_image?: Express.Multer.File[];
  }) {
    if (files.audio && files.audio.length > 0) {
      this.validateFile(files.audio[0], 'audio');
    }

    if (files.cover_image && files.cover_image.length > 0) {
      this.validateFile(files.cover_image[0], 'image');
    }

    return files;
  }

  private validateFile(
    file: Express.Multer.File,
    type: 'image' | 'audio',
  ): void {
    // Validate file type
    if (type === 'image') {
      if (!ALLOWED_IMAGE_TYPES.test(file.mimetype)) {
        throw new BadRequestException(
          `Invalid image file type. Allowed formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
        );
      }
    } else if (type === 'audio') {
      if (!ALLOWED_AUDIO_TYPES.test(file.mimetype)) {
        throw new BadRequestException(
          `Invalid audio file type. Allowed formats: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`,
        );
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      throw new BadRequestException(
        `${type.charAt(0).toUpperCase() + type.slice(1)} file size exceeds limit. ` +
          `Current size: ${currentSizeMB}MB, Maximum allowed: ${MAX_FILE_SIZE_MB}MB`,
      );
    }
  }
}

@Injectable()
export class UpdatePlaylistFileValidator implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file) {
      this.validateFile(file);
      return file;
    }
    return null;
  }

  private validateFile(file: Express.Multer.File): void {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.test(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image file type. Allowed formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      throw new BadRequestException(
        `Image file size exceeds limit. ` +
          `Current size: ${currentSizeMB}MB, Maximum allowed: ${MAX_FILE_SIZE_MB}MB`,
      );
    }
  }
}

@Injectable()
export class CreateAlbumFileValidator implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (file) {
      this.validateFile(file);
      return file;
    }
    return null;
  }

  private validateFile(file: Express.Multer.File): void {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.test(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image file type. Allowed formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      throw new BadRequestException(
        `Image file size exceeds limit. ` +
          `Current size: ${currentSizeMB}MB, Maximum allowed: ${MAX_FILE_SIZE_MB}MB`,
      );
    }
  }
}

@Injectable()
export class UpdateUserAvatarValidator extends CreateAlbumFileValidator {}
