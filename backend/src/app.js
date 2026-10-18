import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { HttpError, errorHandler } from './common/errors.js';
import { createAuth } from './modules/auth.js';
import { createUserService } from './modules/users/users.create.js';
import { createService as createUserManagementService } from './modules/users/users.service.js';
import { createRouter as createUserManagementRouter } from './modules/users/users.routes.js';
import { resources } from './modules/index.js';
import { createRouter as createDepartmentsRouter } from './modules/departments/departments.routes.js';
import { createRouter as createPositionsRouter } from './modules/positions/positions.routes.js';
import { createValidationRouter } from './modules/data-validation/data-validation.routes.js';
import { createDashboardRouter, createReportsRouter } from './modules/dashboard/dashboard.routes.js';
import { createDistanceService } from './modules/distance/distance.service.js';
import { createRouter as createDistanceRouter } from './modules/distance/distance.routes.js';
import { createDistanceImportJobs } from './modules/distance/distance-import.jobs.js';
import { createDistanceImportRouter } from './modules/distance/distance-import.routes.js';
import { fileURLToPath } from 'node:url';

export function createApp({ db, config, mailer, otpStore, distanceService }) {
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
  app.use(helmet(), cors({ origin: config.origin, credentials: true }), express.json({ limit: '256kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get('/health/live', (req, res) => res.json({ status: 'ok' }));
  if (process.env.NODE_ENV !== 'production') {
    for (const [route, file] of [['/distance-import-demo', 'distance-import.html'],
      ['/distance-import-demo.js', 'distance-import.js'], ['/distance-import-demo.css', 'distance-import.css']]) {
      app.get(route, (req, res) => {
        res.set('Cache-Control', 'no-store');
        res.sendFile(fileURLToPath(new URL(`../demo/${file}`, import.meta.url)));
      });
    }
  }
  app.get('/health/ready', async (req, res) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });
  const auth = createAuth(db, config, mailer, otpStore);
  app.use('/api/auth', auth.router);
  app.use('/api/v1/auth', auth.router);
  const createUser = createUserService(auth.repository, config, auth.mailer);
  app.post(['/api/auth/user_register', '/api/v1/auth/user_register'], auth.authenticate, auth.authorize('admin'), async (req, res) => {
    res.status(201).json(await createUser(req.user.id, req.body));
  });
  const userManagement = createUserManagementService(db, config);
  const userRouter = createUserManagementRouter(userManagement);
  app.use(['/api/users', '/api/v1/users'], auth.authenticate, userRouter);
  app.use('/api/departments', auth.authenticate, auth.authorize('catalog'), createDepartmentsRouter(db));
  app.use('/api/positions', auth.authenticate, auth.authorize('catalog'), createPositionsRouter(db));
  app.get(['/api/roles', '/api/v1/user-management/roles'], auth.authenticate, async (req, res) => {
    res.json(await userManagement.roles(req.user));
  });
  const distance = distanceService ?? createDistanceService(config.routing);
  app.use('/api/v1/distance/imports', auth.authenticate, auth.authorize('distanceImport'),
    createDistanceImportRouter(createDistanceImportJobs(distance)));
  app.use(['/api/distance', '/api/v1/distance'], auth.authenticate, auth.authorize('employees'), createDistanceRouter(distance));
  app.use('/api/v1', auth.authenticate);
  for (const resource of resources) {
    app.use(`/api/v1${resource.path}`, auth.authorize(resource.permission), resource.createRouter(db, { distanceService: distance }));
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
