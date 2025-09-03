export const MAX_FILE_SIZE_MB = 25; // 25MB

export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // convert to bytes

export const ALLOWED_IMAGE_TYPES =
  /^image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml)$/;

export const ALLOWED_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif'];

export const ALLOWED_AUDIO_TYPES = /^audio\/(mpeg|mp3|wav|ogg|aac|flac)$/;

export const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
