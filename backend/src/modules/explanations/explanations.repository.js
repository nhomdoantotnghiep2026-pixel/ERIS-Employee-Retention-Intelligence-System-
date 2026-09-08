import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "prediction_factors",
  "columns": [
    "id",
    "prediction_id",
    "factor_name",
    "factor_value",
    "importance_score",
    "impact_direction",
    "created_at"
  ],
  "filters": [
    "prediction_id"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

