import { Router } from 'express';
import { HttpError } from '../../common/errors.js';
import { resolveEmployeeDistance } from './address-resolution.js';

export const createRouter = service => {
  const router = Router();
  router.post('/resolve-address', async (req, res) => {
    if (!req.body || Object.keys(req.body).some(key => key !== 'address') || typeof req.body.address !== 'string'
      || !req.body.address.trim() || req.body.address.trim().length > 300) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Provide address text with 1 to 300 characters');
    }
    res.json(await resolveEmployeeDistance(req.body.address.trim(), service));
  });
  router.get('/places', async (req, res) => {
    const hasFocus = req.query.focusLat !== undefined || req.query.focusLng !== undefined;
    let focus;
    if (hasFocus) {
      const latitude = Number(req.query.focusLat);
      const longitude = Number(req.query.focusLng);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
        || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR',
          message: 'focusLat and focusLng must be valid coordinates', request_id: req.id } });
      }
      focus = { latitude, longitude };
    }
    res.json({ places: await service.search(req.query.query, focus) });
  });
  router.post('/calculate', async (req, res) => res.json(await service.calculate(req.body)));
  return router;
};
