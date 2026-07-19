import { z } from 'zod';

const optionalNonEmptyString = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().optional()
);

const optionalUrl = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().url().optional()
);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  
  // Supabase
  SUPABASE_URL: optionalUrl,
  SUPABASE_ANON_KEY: optionalNonEmptyString,
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmptyString,
  
  // Redis
  REDIS_URL: optionalNonEmptyString,
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  
  // JWT
  JWT_SECRET: optionalNonEmptyString,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // Email
  RESEND_API_KEY: optionalNonEmptyString,
  EMAIL_FROM: z.string().default('noreply@placeaset.com'),
  
  // Feature Flags
  ENABLE_OCR: z.string().default('false'),
  ENABLE_AI_DEDUP: z.string().default('false'),
  ENABLE_ANTI_CHEAT: z.string().default('true'),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_FORMAT: z.string().default('json'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error(error.errors);
    } else {
      console.error('❌ Environment validation failed:', error);
    }
    console.warn('⚠️  Running with defaults. Set environment variables for production.');
    return envSchema.parse({});
  }
}
