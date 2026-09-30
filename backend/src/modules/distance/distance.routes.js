import { Router } from 'express';

export const createRouter = service => {
  const router = Router();
  router.post('/calculate', async (req, res) => res.json(await service.calculate(req.body)));
  return router;
};
