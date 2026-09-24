import { Router } from 'express';

export function createRouter(service) {
  const router = Router();
  router.get('/', async (req, res) => res.json(await service.list(req.user, req.query)));
  router.get('/:id', async (req, res) => res.json(await service.get(req.user, req.params.id)));
  router.patch('/:id', async (req, res) => res.json(await service.updateProfile(req.user, req.params.id, req.body)));
  router.patch('/:id/status', async (req, res) => res.json(await service.updateStatus(req.user, req.params.id, req.body)));
  router.patch('/:id/role', async (req, res) => res.json(await service.updateRole(req.user, req.params.id, req.body)));
  return router;
}
