import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rateLimiter';
import { activityLogger } from './middleware/activityLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import v1Router from './routes/v1';

const app: Express = express();

// Security
app.use(helmet());

// CORS configuration supporting http://localhost:3000, http://localhost:3001 and ALLOWED_ORIGINS
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, allowedOrigins[0] || 'http://localhost:3000');
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
  optionsSuccessStatus: 204,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}
app.use(activityLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/v1', v1Router);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'PLACE@ASET API',
      version: '1.0.0',
      description: 'Competitive Learning & Assessment Platform',
      api: '/api/v1',
      health: '/api/v1/health',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
