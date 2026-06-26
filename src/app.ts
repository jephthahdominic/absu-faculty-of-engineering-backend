import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/environment';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { logger } from './utils/logger.util';
import routes from './routes/index';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(compression());

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.path === '/health',
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(globalRateLimiter);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'ABSU Faculty Management API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.use(
  `${env.API_PREFIX}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'ABSU Faculty Management API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
  }),
);

app.get(`${env.API_PREFIX}/docs.json`, (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(env.API_PREFIX, routes);

app.use('*', notFoundHandler);

app.use(errorHandler);

export default app;
