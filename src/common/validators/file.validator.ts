import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadTrackFilesValidator implements PipeTransform {
  private readonly MAX_SIZES = {
    image: 10 * 1024 * 1024, // 10 MB
    audio: 15 * 1024 * 1024, // 15 MB
  };

  private readonly ALLOWED_TYPES = {
    image: /^image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml)$/,
    audio: /^audio\/(mpeg|mp3|wav|ogg|aac|flac)$/,
  };

  private readonly ALLOWED_EXTENSIONS = {
    image: ['jpeg', 'jpg', 'png', 'gif'],
    audio: ['mp3', 'wav', 'ogg', 'aac', 'flac'],
  };

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
    if (!this.ALLOWED_TYPES[type].test(file.mimetype)) {
      throw new BadRequestException(
        `Invalid ${type} file type. Allowed formats: ${this.ALLOWED_EXTENSIONS[type].join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_SIZES[type]) {
      const maxSizeMB = this.MAX_SIZES[type] / (1024 * 1024);
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      throw new BadRequestException(
        `${type.charAt(0).toUpperCase() + type.slice(1)} file size exceeds limit. ` +
          `Current size: ${currentSizeMB}MB, Maximum allowed: ${maxSizeMB}MB`,
      );
    }
  }
}

@Injectable()
export class UpdatePlaylistFileValidator implements PipeTransform {
  private readonly MAX_SIZES = {
    image: 10 * 1024 * 1024, // 10 MB
  };

  private readonly ALLOWED_TYPES = {
    image: /^image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml)$/,
  };

  private readonly ALLOWED_EXTENSIONS = {
    image: ['jpeg', 'jpg', 'png', 'gif'],
  };

  transform(file: Express.Multer.File) {
    if (file) {
      this.validateFile(file);
    }

    return file;
  }

  private validateFile(file: Express.Multer.File): void {
    // Validate file type
    if (!this.ALLOWED_TYPES['image'].test(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image file type. Allowed formats: ${this.ALLOWED_EXTENSIONS['image'].join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_SIZES['image']) {
      const maxSizeMB = this.MAX_SIZES['image'] / (1024 * 1024);
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);

      throw new BadRequestException(
        `Image file size exceeds limit. ` +
          `Current size: ${currentSizeMB}MB, Maximum allowed: ${maxSizeMB}MB`,
      );
    }
  }
}
