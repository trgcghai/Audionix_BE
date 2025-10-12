import { parseBuffer } from 'music-metadata';
import * as sharp from 'sharp';

/**
 * Return audio duration in seconds
 */
const getAudioDuration = async (
  file: Express.Multer.File,
  unit: 'sec' | 'ms' = 'sec',
): Promise<{ duration: number | null }> => {
  try {
    const metadata = await parseBuffer(file.buffer);
    return {
      duration:
        unit === 'sec'
          ? (metadata.format.duration ?? 0)
          : (metadata.format.duration ?? 0) * 1000,
    };
  } catch (error) {
    console.error(
      'Get audio metadata error',
      (error as Error).stack || (error as Error).message,
    );
    return {
      duration: 0,
    };
  }
};

const getImageDimensions = async (
  file: Express.Multer.File,
): Promise<{ width: number; height: number }> => {
  try {
    const image = sharp(file.buffer); // use buffer from multer
    const metadata = await image.metadata();
    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  } catch (error) {
    console.error(
      'Get image dimension error',
      (error as Error).stack || (error as Error).message,
    );
    return {
      width: 0,
      height: 0,
    };
  }
};

export { getAudioDuration, getImageDimensions };
