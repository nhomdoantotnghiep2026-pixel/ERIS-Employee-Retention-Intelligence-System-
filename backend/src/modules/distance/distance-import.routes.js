import { Router } from 'express';
import { HttpError } from '../../common/errors.js';
import { outputColumns, writeCsv } from './distance-import.js';

export function createDistanceImportRouter(jobs) {
  const router = Router();
  router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.post('/preview', (req, res) => res.json(jobs.preview(req.body?.csv)));
  router.post('/', (req, res) => res.status(202).json(jobs.create(req.user.id, req.body?.csv)));
  router.get('/:id', (req, res) => res.json(jobs.get(req.user.id, req.params.id)));
  router.get('/:id/download', (req, res) => {
    const job = jobs.get(req.user.id, req.params.id);
    if (job.status !== 'COMPLETED') throw new HttpError(409, 'IMPORT_NOT_COMPLETE', 'Wait for the import to finish');
    res.type('text/csv').attachment(`distance-import-${job.id}.csv`).send(writeCsv(job.rows, outputColumns));
  });
  return router;
}
