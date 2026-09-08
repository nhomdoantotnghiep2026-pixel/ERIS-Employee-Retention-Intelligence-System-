import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "retention_actions",
  "columns": [
    "id",
    "employee_id",
    "prediction_id",
    "created_by",
    "action_type",
    "description",
    "status",
    "scheduled_date",
    "completed_at",
    "created_at",
    "updated_at"
  ],
  "filters": [
    "employee_id",
    "prediction_id",
    "created_by"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

