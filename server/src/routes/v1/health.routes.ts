import { Router, Request, Response } from 'express';
import { getSupabase } from '../../config/database';
import { getRedis } from '../../config/redis';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {},
  };

  // Check Supabase
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('colleges').select('id').limit(1);
    health.services.database = error ? 'degraded' : 'healthy';
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    health.services.database = message.includes('not initialized')
      ? 'not_configured'
      : 'unhealthy';
  }

  // Check Redis
  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      health.services.cache = 'healthy';
    } else {
      health.services.cache = 'not_configured';
    }
  } catch {
    health.services.cache = 'unhealthy';
  }

  const statusCode =
    health.services.database === 'unhealthy' || health.services.database === 'degraded'
      ? 503
      : 200;
  res.status(statusCode).json({ success: true, data: health });
});

export default router;
