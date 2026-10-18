import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "prediction_results",
  "filters": [
    "employee_id",
    "snapshot_id",
    "prediction_run_id"
  ],
  "columns": [
    "id",
    "prediction_run_id",
    "employee_id",
    "snapshot_id",
    "attrition_probability",
    "risk_level",
    "prediction_label",
    "created_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
