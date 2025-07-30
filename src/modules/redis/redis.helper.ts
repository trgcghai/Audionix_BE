import { RedisItemName, RedisServiceName } from './redis-key.enum';

/**
 * Type definition for Redis key structure
 */
export type RedisKey = `${RedisServiceName}:${RedisItemName}:${string}`;

/**
 * Creates a properly formatted Redis key
 * @param service The service name
 * @param item The item name
 * @param id The unique identifier
 * @returns A properly formatted Redis key
 */
export function createRedisKey(
  service: RedisServiceName,
  item: RedisItemName,
  id: string,
): RedisKey {
  return `${service}:${item}:${id}`;
}
