import Redis from 'ioredis';

let redis: Redis | null = null;

export function initRedis(): void {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('⚠️  Redis not configured. Caching disabled.');
    return;
  }

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    lazyConnect: true,
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('❌ Redis error:', err.message));

  redis.connect().catch((err) => {
    console.warn('⚠️  Redis connection failed. Running without cache.', err.message);
    redis = null;
  });
}

export function getRedis(): Redis | null {
  return redis;
}
