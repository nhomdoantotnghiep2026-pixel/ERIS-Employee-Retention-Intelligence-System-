import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "employee_outcomes",
  "columns": [
    "id",
    "employee_id",
    "outcome",
    "outcome_date",
    "reason",
    "recorded_by",
    "created_at"
  ],
  "filters": [
    "employee_id"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

