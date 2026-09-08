import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "predictions",
  "columns": [
    "id",
    "employee_id",
    "snapshot_id",
    "model_version_id",
    "risk_score",
    "risk_level",
    "predicted_attrition",
    "predicted_at"
  ],
  "filters": [
    "employee_id",
    "snapshot_id",
    "model_version_id"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

