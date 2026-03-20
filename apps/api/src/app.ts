import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './lib/logger';
import authRoutes from './modules/auth/auth.routes';
import dealersRoutes from './modules/dealers/dealers.routes';
import beneficiariesRoutes from './modules/beneficiaries/beneficiaries.routes';
import distributionRoutes from './modules/distribution/distribution.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import auditRoutes from './modules/audit/audit.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OMS National Food Control API',
      version: '1.0.0',
      description: 'Ministry of Food · Directorate General of Food · Bangladesh',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dealers', dealersRoutes);
app.use('/api/v1/beneficiaries', beneficiariesRoutes);
app.use('/api/v1/distribution', distributionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/audit', auditRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found`, code: 'NOT_FOUND' });
});

// Global error handler
app.use((err: Error & { statusCode?: number; code?: string }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  logger.error('Unhandled error', { err, path: req.path, method: req.method });
  res.status(statusCode).json({ success: false, error: err.message, code });
});

const PORT = parseInt(process.env.PORT ?? '3000');
app.listen(PORT, () => {
  logger.info(`OMS API running on port ${PORT}`);
  logger.info(`Swagger docs: http://localhost:${PORT}/api/docs`);
});

export default app;
