import { Router } from 'express';
import { createService } from './employees.service.js';

export const permission = 'employees';
export const createRouter = (db, options) => {
  const service = createService(db, options), router = Router();
  router.get('/', async (req, res) => res.json(await service.list(req.query)));
  router.get('/:id', async (req, res) => res.json(await service.get(req.params.id)));
  router.post('/', async (req, res) => res.status(201).json(await service.create(req.user.id, req.body)));
  router.patch('/:id', async (req, res) => res.json(await service.update(req.user.id, req.params.id, req.body)));
  return router;
};

