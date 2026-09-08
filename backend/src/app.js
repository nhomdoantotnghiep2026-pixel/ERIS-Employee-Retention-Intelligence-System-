import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { HttpError, errorHandler } from './common/errors.js';
import { createAuth } from './modules/auth.js';
import { resources } from './modules/index.js';
import { createValidationRouter } from './modules/data-validation/data-validation.routes.js';
import { createDashboardRouter, createReportsRouter } from './modules/dashboard/dashboard.routes.js';

export function createApp({ db, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.id = randomUUID(); res.set('X-Request-ID', req.id);
    const started = Date.now();
    res.on('finish', () => console.info(JSON.stringify({
      request_id: req.id, method: req.method, status: res.statusCode, duration_ms: Date.now() - started,
    })));
    next();
  });
  app.use(helmet(), cors({ origin: config.origin }), express.json({ limit: '256kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get('/health/live', (req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', async (req, res) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });
  const auth = createAuth(db, config);
  app.use('/api/v1/auth', auth.router);
  app.use('/api/v1', auth.authenticate);
  for (const resource of resources) {
    app.use(`/api/v1${resource.path}`, auth.authorize(resource.permission), resource.createRouter(db));
  }
  app.use('/api/v1/data-validation', auth.authorize('validation'), createValidationRouter());
  app.use('/api/v1/dashboard', auth.authorize('analysis'), createDashboardRouter(db));
  app.use('/api/v1/reports', auth.authorize('analysis'), createReportsRouter(db));
  app.post('/api/v1/predictions', auth.authorize('validation'), () => {
    throw new HttpError(503, 'MODEL_NOT_READY',
      'Prediction generation is not configured: feature mapping and trained model are required');
  });
  app.use((req, res, next) => next(new HttpError(404, 'ROUTE_NOT_FOUND', 'Route not found')));
  app.use(errorHandler);
  return app;
}
