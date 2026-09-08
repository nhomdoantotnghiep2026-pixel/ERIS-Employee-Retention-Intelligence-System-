import { Router } from 'express';
import { catalog, modelFeatures, validateFeatures } from './feature-validator.js';
import { HttpError } from '../../common/errors.js';

export function createValidationRouter() {
  const router = Router();
  router.get('/catalog', (req, res) => res.json({ model_feature_count: modelFeatures.length, data: catalog }));
  router.post('/features', (req, res) => {
    const result = validateFeatures(req.body);
    res.status(result.valid ? 200 : 422).json(result);
  });
  // Validate an already parsed batch. This endpoint never imports rows into the DB.
  router.post('/batch', (req, res) => {
    if (!Array.isArray(req.body?.rows) || req.body.rows.length < 1 || req.body.rows.length > 100) {
      throw new HttpError(400, 'INVALID_BATCH', 'rows must contain 1 to 100 feature objects');
    }
    const results = req.body.rows.map((row, index) => {
      const { features, ...result } = validateFeatures(row);
      return { row: index + 1, ...result };
    });
    const valid = results.every(row => row.valid);
    res.status(valid ? 200 : 422).json({ valid, results });
  });
  return router;
}
