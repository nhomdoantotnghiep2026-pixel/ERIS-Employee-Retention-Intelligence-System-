import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "explainable",
  "filters": [
    "prediction_result_id"
  ],
  "columns": [
    "id",
    "prediction_result_id",
    "feature_name",
    "feature_value",
    "impact_value",
    "impact_direction",
    "rank_order",
    "created_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
