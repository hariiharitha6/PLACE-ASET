import { getRedis } from '../config/redis';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from './logger';

/**
 * Gets a parsed JSON value from Redis.
 */
export async function cacheGet(key: string): Promise<any | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err: any) {
    logger.warn('Cache get failed', { key, error: err.message });
    return null;
  }
}

/**
 * Sets a value in Redis with a TTL.
 */
export async function cacheSet(key: string, value: any, ttlSeconds = 300): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const stringified = JSON.stringify(value);
    await redis.set(key, stringified, 'EX', ttlSeconds);
  } catch (err: any) {
    logger.warn('Cache set failed', { key, error: err.message });
  }
}

/**
 * Deletes a key from Redis.
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err: any) {
    logger.warn('Cache delete failed', { key, error: err.message });
  }
}

/**
 * Deletes keys matching a pattern.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err: any) {
    logger.warn('Cache delete pattern failed', { pattern, error: err.message });
  }
}

/**
 * Express middleware to cache responses based on request URL and user college scope.
 */
export function cacheMiddleware(prefix: string, ttlSeconds = 60) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const redis = getRedis();
    if (!redis || !req.user) {
      return next();
    }

    const collegeId = req.user.collegeId || 'global';
    // Create cache key based on route path, query params, and college scope
    const queryStr = JSON.stringify(req.query || {});
    const cacheKey = `cache:${prefix}:${collegeId}:${req.originalUrl}:${queryStr}`;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      // Override res.json to capture and store payload
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        // Cache only successful JSON responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(cacheKey, body, ttlSeconds);
        }
        return originalJson(body);
      };

      next();
    } catch (err: any) {
      logger.warn('Cache middleware error', { error: err.message });
      next();
    }
  };
}
