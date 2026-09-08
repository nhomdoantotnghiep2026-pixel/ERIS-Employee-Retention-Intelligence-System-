import { Router } from 'express';
import { createDashboardRepository } from './dashboard.repository.js';
import { toCsv } from '../reports/csv.js';

export function createDashboardRouter(db) {
  const repository = createDashboardRepository(db);
  const router = Router();
  router.get('/summary', async (req, res) => res.json({
    data: await repository.summary(),
    scope: 'ACTIVE employees; latest prediction per employee; unassessed included',
  }));
  return router;
}

export function createReportsRouter(db) {
  const repository = createDashboardRepository(db);
  const router = Router();
  router.get('/departments.csv', async (req, res) => {
    const rows = await repository.summary();
    const columns = ['department_id', 'department_name', 'active_employees', 'low', 'medium', 'high', 'unassessed'];
    res.type('text/csv').attachment('eris-departments.csv').send(toCsv(columns, rows));
  });
  return router;
}
