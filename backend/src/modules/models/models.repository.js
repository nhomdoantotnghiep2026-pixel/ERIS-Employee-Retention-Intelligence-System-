import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "model_run",
  "filters": [
    "created_by"
  ],
  "columns": [
    "id",
    "name",
    "period_start",
    "period_end",
    "status",
    "total_employees",
    "model_version",
    "created_by",
    "started_at",
    "completed_at",
    "created_at"
  ]
};
export const createRepository = db => createReadRepository(db, definition);
