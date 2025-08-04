import { Injectable } from '@nestjs/common';
import { RedisItemName, RedisServiceName } from '@redis/redis-key.enum';
import { RedisService } from '@redis/redis.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 2;
  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate a new OTP for the given identifier
   * @param identifier User identifier (email, phone, etc.)
   * @returns The generated OTP code
   */
  async generateOtp(identifier: string): Promise<string> {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiration time (10 minutes from now)
    const expiryTimeInSeconds = this.OTP_EXPIRY_MINUTES * 60;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    const key = `${RedisServiceName.AUTH}:${RedisItemName.VERIFICATION_CODE}:${identifier}`;

    // Store in Redis
    await this.redisService.setJson(
      key,
      {
        code,
        expiresAt,
      },
      expiryTimeInSeconds,
    );

    return code;
  }

  /**
   * Verify an OTP for the given identifier
   * @param identifier User identifier (email, phone, etc.)
   * @param otpCode The OTP code to verify
   * @returns Boolean indicating if the OTP is valid
   */
  async verifyOtp(identifier: string, otpCode: string): Promise<boolean> {
    // Try to get from Redis first
    const key = `${RedisServiceName.AUTH}:${RedisItemName.VERIFICATION_CODE}:${identifier}`;
    const { code, expiresAt } = await this.redisService.getJson(key);

    const currentTime = new Date();

    // Check if the code exists and is not expired
    if (!code || !expiresAt || currentTime > new Date(expiresAt)) {
      return false; // OTP expired or does not exist
    }

    // Check if the provided code matches the stored code
    if (code !== otpCode) {
      return false; // Invalid OTP
    }

    // Delete the code after successful verification
    await this.redisService.del(key);
    return true;
  }
}
