import { Router } from 'express';
import { createService } from './departments.service.js';

export const permission = 'admin';
export const createRouter = db => {
  const service = createService(db);
  const router = Router();
  router.get('/', async (req, res) => res.json(await service.list(req.query)));
  router.get('/:id', async (req, res) => res.json({ data: await service.get(req.params.id) }));
  router.post('/', async (req, res) => res.status(201).json(await service.create(req.user.id, req.body)));
  router.patch('/:id', async (req, res) => res.json(await service.update(req.user.id, req.params.id, req.body)));
  return router;
};
