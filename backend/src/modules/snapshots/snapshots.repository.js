import { createReadRepository } from '../../common/read-resource.js';

export const definition = {
  "table": "employee_snapshots",
  "columns": [
    "id",
    "employee_id",
    "snapshot_date",
    "monthly_income",
    "years_at_company",
    "years_in_current_role",
    "job_satisfaction",
    "environment_satisfaction",
    "work_life_balance",
    "job_involvement",
    "performance_rating",
    "overtime",
    "distance_from_home",
    "training_times_last_year",
    "years_since_last_promotion",
    "created_at"
  ],
  "filters": [
    "employee_id"
  ]
};
export const createRepository = db => createReadRepository(db, definition);

